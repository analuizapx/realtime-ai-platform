import { Inject, Injectable, Logger } from '@nestjs/common';
import type {
  FrameInput,
  InferenceProvider,
  InferenceResult,
} from './interfaces/inference.interface';
import { CircuitBreaker } from './resilience/circuit-breaker';
import { withRetry, withTimeout } from './resilience/retry';
import { EventsService } from './events.service';

// Injection token for the active inference provider.
// The module decides which concrete class this resolves to (mock, ONNX, ...).
export const INFERENCE_PROVIDER = 'INFERENCE_PROVIDER';

// Resilience tuning
const TIMEOUT_MS = 2000; // abort a single attempt after 2s
const RETRY_ATTEMPTS = 3; // try up to 3 times
const FAILURE_THRESHOLD = 5; // open the circuit after 5 failures
const COOLDOWN_MS = 10000; // stay open for 10s before testing again

@Injectable()
export class InferenceService {
  private readonly logger = new Logger(InferenceService.name);

  // One breaker guards every call to the provider
  private readonly breaker = new CircuitBreaker({
    failureThreshold: FAILURE_THRESHOLD,
    cooldownMs: COOLDOWN_MS,
  });

  constructor(
    @Inject(INFERENCE_PROVIDER)
    private readonly provider: InferenceProvider,
    private readonly eventsService: EventsService,
  ) {}

  async runInference(frame: FrameInput): Promise<InferenceResult> {
    this.logger.log(
      `Running inference requestId=${frame.requestId} provider=${this.provider.name}`,
    );

    // Layers (outer to inner): circuit breaker -> retry -> timeout -> provider
    const result = await this.breaker.execute(() =>
      withRetry(
        () => withTimeout(() => this.provider.infer(frame), TIMEOUT_MS),
        RETRY_ATTEMPTS,
      ),
    );

    // Persist the event (idempotent on requestId)
    await this.eventsService.save(frame, this.provider.name, result);

    this.logger.log(
      `Inference done requestId=${frame.requestId} risk=${result.risk.level} ` +
        `breaker=${this.breaker.getState()}`,
    );
    return result;
  }

  // Exposed so the metrics endpoint can report breaker state later
  getBreakerState() {
    return this.breaker.getState();
  }
}
