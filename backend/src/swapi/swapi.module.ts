import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SwapiController } from './swapi.controller';
import { SwapiService } from './swapi.service';

@Module({
  // HttpModule provides HttpService; set a timeout so slow SWAPI calls fail fast
  imports: [HttpModule.register({ timeout: 10000 })],
  controllers: [SwapiController],
  providers: [SwapiService],
})
export class SwapiModule {}
