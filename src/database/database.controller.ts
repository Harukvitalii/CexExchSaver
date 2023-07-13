import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Exchange } from './exchange.model';
import { Record } from './record.model';
import { DatabaseService } from './database.service';

@Controller()
export class DatabaseController {}
