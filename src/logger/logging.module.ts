import { Module } from '@nestjs/common';
import { LoggingService } from 'src/logger/logging.service';

@Module({
  imports: [],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
