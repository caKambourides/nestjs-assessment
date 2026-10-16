import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stream } from '../stream.entity.js';
import { CreateStreamDto } from './dto/create-stream.dto.js';
import { UpdateStreamDto } from './dto/update-stream.dto.js';

export interface StreamResponse {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  created_at: Date;
  updated_at: Date;
}

export interface PaginatedStreamsResponse {
  data: StreamResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class StreamingService {
  constructor(
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
  ) {}

  async findAll(page = 1, limit = 10, genre?: string): Promise<PaginatedStreamsResponse> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);

    const [streams, total] = await this.streamRepository.findAndCount({
      where: genre ? {genre} : {},
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      order: { id: 'ASC' },
    });

    return {
      data: streams.map(this.toResponse),
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: number): Promise<StreamResponse> {
    const stream = await this.streamRepository.findOne({ where: { id } });
    if (!stream) {
      throw new NotFoundException(`Stream with id ${id} not found`);
    }
    return this.toResponse(stream);
  }

  async create(dto: CreateStreamDto): Promise<StreamResponse> {
    const stream = this.streamRepository.create({
      title: dto.title,
      description: dto.description,
      thumbnailUrl: dto.thumbnail_url,
      videoUrl: dto.video_url,
    });
    const saved = await this.streamRepository.save(stream);
    return this.toResponse(saved);
  }

  async update(id: number, dto: UpdateStreamDto): Promise<StreamResponse> {
    const stream = await this.streamRepository.findOne({ where: { id } });
    if (!stream) {
      throw new NotFoundException(`Stream with id ${id} not found`);
    }

    if (dto.title !== undefined) stream.title = dto.title;
    if (dto.description !== undefined) stream.description = dto.description;
    if (dto.thumbnail_url !== undefined) stream.thumbnailUrl = dto.thumbnail_url;
    if (dto.video_url !== undefined) stream.videoUrl = dto.video_url;

    const saved = await this.streamRepository.save(stream);
    return this.toResponse(saved);
  }

  async remove(id: number): Promise<void> {
    const stream = await this.streamRepository.findOne({ where: { id } });
    if (!stream) {
      throw new NotFoundException(`Stream with id ${id} not found`);
    }
    await this.streamRepository.remove(stream);
  }

  private toResponse(stream: Stream): StreamResponse {
    return {
      id: stream.id,
      title: stream.title,
      description: stream.description,
      thumbnail_url: stream.thumbnailUrl,
      video_url: stream.videoUrl,
      created_at: stream.createdAt,
      updated_at: stream.updatedAt,
    };
  }
}
