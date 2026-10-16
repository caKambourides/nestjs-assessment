import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stream } from '../stream.entity.js';
import { StreamingController } from './streaming.controller.js';
import { StreamingService } from './streaming.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Stream])],
  controllers: [StreamingController],
  providers: [StreamingService],
})
export class StreamingModule {}
