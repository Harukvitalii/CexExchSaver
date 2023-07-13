import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
import ccxt from 'ccxt';
//config service

@Injectable()
export class SaverService {
  constructor(private configService: ConfigService) {}

  async getExcanges(): Promise<any> {
    console.log(ccxt.exchanges);
    return '1';
  }
}
