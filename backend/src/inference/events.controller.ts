import { Controller, Get, Query } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // GET /events/recent?limit=20 -> latest events for the side panel
  @Get('recent')
  recent(@Query('limit') limit?: string) {
    return this.eventsService.recent(limit ? Number(limit) : 20);
  }

  // GET /events/stats -> the three aggregated queries for the dashboard
  @Get('stats')
  async stats() {
    const [ppe, emotions, highRiskGap, total] = await Promise.all([
      this.eventsService.ppeDistribution(),
      this.eventsService.emotionDistribution(),
      this.eventsService.avgTimeBetweenHighRisk(),
      this.eventsService.countAll(),
    ]);

    return {
      totalEvents: total,
      ppeDistribution: ppe,
      emotionDistribution: emotions,
      avgTimeBetweenHighRisk: highRiskGap,
    };
  }
}
