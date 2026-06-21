import { IsOptional, IsString } from 'class-validator';

// Body of POST /inference/frames
export class CreateFrameDto {
  // Required for idempotency: the same requestId must not be processed twice
  @IsString()
  requestId: string;

  @IsOptional()
  @IsString()
  frameId?: string;

  @IsOptional()
  @IsString()
  imageRef?: string;
}
