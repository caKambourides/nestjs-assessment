import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service.js';
import { AuthGuard } from './guards/auth.guard.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

@Controller('bello')
@UseGuards(AuthGuard)
export class MyController {
  constructor(private readonly appService: AppService) {}

  @Get('world')
  getHello(): string {
    return 'aawdaw';
    return this.appService.getHello();
  }
}
