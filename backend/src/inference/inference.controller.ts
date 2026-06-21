import { Body, Controller, Post } from '@nestjs/common';
import { InferenceService } from './inference.service';
import { CreateFrameDto } from './dto/create-frame.dto';

@Controller('inference')
export class InferenceController {
  constructor(private readonly inferenceService: InferenceService) {}

  // POST /inference/frames -> run the inference engine on a frame
  @Post('frames')
  async analyzeFrame(@Body() dto: CreateFrameDto) {
    return this.inferenceService.runInference(dto);
  }
}
