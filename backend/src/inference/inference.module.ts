import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InferenceController } from './inference.controller';
import { InferenceService, INFERENCE_PROVIDER } from './inference.service';
import { MockProvider } from './providers/mock.provider';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { InferenceGateway } from './inference.gateway';
import { Event, EventSchema } from './schemas/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    // Same JWT config as AuthModule, so the gateway can verify stream tokens
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [InferenceController, EventsController],
  providers: [
    InferenceService,
    EventsService,
    InferenceGateway,
    // Bind the provider token to the concrete implementation.
    // Swap MockProvider here for a real engine (ONNX/Azure) with no other changes.
    { provide: INFERENCE_PROVIDER, useClass: MockProvider },
  ],
  exports: [InferenceService, EventsService],
})
export class InferenceModule {}
