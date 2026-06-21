import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { InferenceService } from './inference.service';
import { EventsService } from './events.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly inferenceService: InferenceService,
    private readonly eventsService: EventsService,
  ) {}

  // GET /health/metrics -> observability snapshot
  @Get('metrics')
  async metrics() {
    const metrics = this.metricsService.snapshot();
    const totalInDb = await this.eventsService.countAll();

    return {
      ...metrics,
      circuitBreaker: this.inferenceService.getBreakerState(),
      eventsInDatabase: totalInDb,
      timestamp: new Date().toISOString(),
    };
  }
}
