import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { FrameInput, InferenceResult } from './interfaces/inference.interface';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  // Persist an inference result. Idempotent: a repeated requestId is ignored.
  async save(
    frame: FrameInput,
    provider: string,
    result: InferenceResult,
  ): Promise<EventDocument> {
    const doc = {
      requestId: frame.requestId,
      frameId: frame.frameId ?? frame.requestId,
      provider,
      emotions: result.emotions,
      ppe: result.ppe,
      risk: result.risk,
      riskLevel: result.risk.level,
      latencyMs: result.latency_ms,
    };

    // upsert on requestId -> storing the same request twice won't duplicate
    return this.eventModel.findOneAndUpdate(
      { requestId: frame.requestId },
      { $setOnInsert: doc },
      { new: true, upsert: true },
    );
  }

  // Most recent events (for the side panel in the UI)
  async recent(limit = 20): Promise<EventDocument[]> {
    return this.eventModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }

  async countAll(): Promise<number> {
    return this.eventModel.countDocuments().exec();
  }

  // ---------- Aggregation 1: % of detections per PPE class ----------
  async ppeDistribution() {
    return this.eventModel.aggregate([
      { $unwind: '$ppe' }, // one row per PPE detection
      { $group: { _id: '$ppe.class', count: { $sum: 1 } } },
      { $group: { _id: null, total: { $sum: '$count' }, classes: { $push: { class: '$_id', count: '$count' } } } },
      { $unwind: '$classes' },
      {
        $project: {
          _id: 0,
          class: '$classes.class',
          count: '$classes.count',
          // percentage of all PPE detections
          percentage: {
            $round: [
              { $multiply: [{ $divide: ['$classes.count', '$total'] }, 100] },
              1,
            ],
          },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  // ---------- Aggregation 2: emotion distribution ----------
  async emotionDistribution() {
    return this.eventModel.aggregate([
      { $unwind: '$emotions' },
      { $group: { _id: '$emotions.label', count: { $sum: 1 } } },
      { $project: { _id: 0, emotion: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }

  // ---------- Aggregation 3: average time between HIGH-risk events ----------
  async avgTimeBetweenHighRisk(): Promise<{ avgSeconds: number | null; samples: number }> {
    // Get the timestamps of all HIGH-risk events in order
    const highRisk = await this.eventModel
      .find({ riskLevel: 'HIGH' })
      .sort({ createdAt: 1 })
      .select('createdAt')
      .lean<Array<{ createdAt: Date }>>()
      .exec();

    if (highRisk.length < 2) {
      // Not enough data to measure a gap
      return { avgSeconds: null, samples: highRisk.length };
    }

    // Sum the gaps between consecutive high-risk events
    let totalMs = 0;
    for (let i = 1; i < highRisk.length; i++) {
      const prev = new Date(highRisk[i - 1].createdAt).getTime();
      const curr = new Date(highRisk[i].createdAt).getTime();
      totalMs += curr - prev;
    }

    const avgSeconds = Math.round(totalMs / (highRisk.length - 1) / 1000);
    return { avgSeconds, samples: highRisk.length };
  }
}
