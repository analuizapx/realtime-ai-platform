import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type {
  Emotion,
  PpeDetection,
  Risk,
} from '../interfaces/inference.interface';

export type EventDocument = HydratedDocument<Event>;

// One document per processed frame/inference.
@Schema({ timestamps: true, collection: 'events' })
export class Event {
  // requestId enables idempotency (unique: the same request is stored once)
  @Prop({ required: true, unique: true })
  requestId: string;

  @Prop()
  frameId: string;

  // Which provider produced this result (mock, onnx, ...)
  @Prop({ required: true })
  provider: string;

  @Prop({ type: Array, default: [] })
  emotions: Emotion[];

  @Prop({ type: Array, default: [] })
  ppe: PpeDetection[];

  @Prop({ type: Object, required: true })
  risk: Risk;

  // Denormalized for fast filtering/aggregation by risk level
  @Prop({ required: true, index: true })
  riskLevel: string;

  @Prop({ required: true })
  latencyMs: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Index on createdAt to speed up "time between high-risk events" queries
EventSchema.index({ createdAt: 1 });
// Compound index for "high-risk events ordered by time"
EventSchema.index({ riskLevel: 1, createdAt: 1 });
