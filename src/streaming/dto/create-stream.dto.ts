import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateStreamDto {
  @ApiProperty({ example: 'My first stream' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A short description of the stream' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'documentary' })
  @IsString()
  @IsNotEmpty()
  genre: string;

  @ApiProperty({ example: 'https://example.com/thumbnail.jpg' })
  @IsUrl()
  thumbnail_url: string;

  @ApiProperty({ example: 'https://example.com/video.mp4' })
  @IsUrl()
  video_url: string;
}
