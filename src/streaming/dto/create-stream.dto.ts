import { ApiProperty } from '@nestjs/swagger';

export class CreateStreamDto {
  @ApiProperty({ example: 'My first stream' })
  title: string;

  @ApiProperty({ example: 'A short description of the stream' })
  description: string;

  @ApiProperty({ example: 'https://example.com/thumbnail.jpg' })
  thumbnail_url: string;

  @ApiProperty({ example: 'https://example.com/video.mp4' })
  video_url: string;
}
