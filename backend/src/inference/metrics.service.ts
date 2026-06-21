import { Injectable } from '@nestjs/common';

/**
 * In-memory counters for observability.
 * Tracks how the inference engine is behaving at runtime:
 * total processed, errors, and average latency.
 */
@Injectable()
export class MetricsService {
  private processed = 0;
  private errors = 0;
  private totalLatencyMs = 0;

  recordSuccess(latencyMs: number): void {
    this.processed++;
    this.totalLatencyMs += latencyMs;
  }

  recordError(): void {
    this.errors++;
  }

  snapshot() {
    const totalCalls = this.processed + this.errors;
    return {
      eventsProcessed: this.processed,
      errors: this.errors,
      // error rate as a 0..1 fraction
      errorRate: totalCalls === 0 ? 0 : round(this.errors / totalCalls),
      avgLatencyMs:
        this.processed === 0 ? 0 : round(this.totalLatencyMs / this.processed),
    };
  }
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
