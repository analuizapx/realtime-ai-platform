import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InferenceController } from './inference.controller';
import { InferenceService, INFERENCE_PROVIDER } from './inference.service';
import { MockProvider } from './providers/mock.provider';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event, EventSchema } from './schemas/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
  controllers: [InferenceController, EventsController],
  providers: [
    InferenceService,
    EventsService,
    // Bind the provider token to the concrete implementation.
    // Swap MockProvider here for a real engine (ONNX/Azure) with no other changes.
    { provide: INFERENCE_PROVIDER, useClass: MockProvider },
  ],
  exports: [InferenceService, EventsService],
})
export class InferenceModule {}
