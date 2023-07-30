import { Controller, Get, Render } from '@nestjs/common';

@Controller('graph')
export class AppController {
  @Get()
  @Render('index')
  root() {
    return { title: 'My NestJS App', message: 'Hello, world!' };
  }
}
