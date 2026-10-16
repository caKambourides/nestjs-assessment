import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateStreamDto } from './create-stream.dto.js';

export class UpdateStreamDto extends PartialType(CreateStreamDto) {
  @ApiProperty({ example: 'My updated stream', required: false })
  title?: string;

  @ApiProperty({ example: 'An updated description', required: false })
  description?: string;

  @ApiProperty({ example: 'https://example.com/new-thumbnail.jpg', required: false })
  thumbnail_url?: string;

  @ApiProperty({ example: 'https://example.com/new-video.mp4', required: false })
  video_url?: string;
}
