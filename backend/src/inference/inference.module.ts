import { Module } from '@nestjs/common';
import { InferenceController } from './inference.controller';
import { InferenceService, INFERENCE_PROVIDER } from './inference.service';
import { MockProvider } from './providers/mock.provider';

@Module({
  controllers: [InferenceController],
  providers: [
    InferenceService,
    // Bind the provider token to the concrete implementation.
    // Swap MockProvider here for a real engine (ONNX/Azure) with no other changes.
    { provide: INFERENCE_PROVIDER, useClass: MockProvider },
  ],
})
export class InferenceModule {}
