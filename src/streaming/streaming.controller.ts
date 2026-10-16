import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StreamingService, StreamResponse, PaginatedStreamsResponse } from './streaming.service.js';
import { CreateStreamDto } from './dto/create-stream.dto.js';
import { UpdateStreamDto } from './dto/update-stream.dto.js';

@ApiTags('streaming')
@Controller('api/streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedStreamsResponse> {
        return this.streamingService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<StreamResponse> {
    return this.streamingService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateStreamDto): Promise<StreamResponse> {
    return this.streamingService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStreamDto,
  ): Promise<StreamResponse> {
    return this.streamingService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.streamingService.remove(id);
  }
}
