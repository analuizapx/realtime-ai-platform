import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SwapiModule } from './swapi/swapi.module';
import { InferenceModule } from './inference/inference.module';

@Module({
  imports: [
    // Loads the .env file and makes ConfigService available everywhere
    ConfigModule.forRoot({ isGlobal: true }),

    // Opens the MongoDB connection using the URI from .env
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),

    UsersModule,
    AuthModule,
    SwapiModule,
    InferenceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
