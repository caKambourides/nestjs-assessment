import { PartialType } from '@nestjs/swagger';
import { CreateStreamDto } from './create-stream.dto.js';

export class UpdateStreamDto extends PartialType(CreateStreamDto) {}
