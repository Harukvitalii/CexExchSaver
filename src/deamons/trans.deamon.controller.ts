import { Controller, Get } from '@nestjs/common';
import { BackgroundService } from './trans.deamon.provider';

@Controller('tasks')
export class TaskController {
  constructor(private readonly BackgroundService: BackgroundService) {}

  @Get()
  getHello(): string {
    return 'deamon tasks is running';
  }
}
