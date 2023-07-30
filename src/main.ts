import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressBodyParserOptions } from '@nestjs/platform-express';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useStaticAssets(join(__dirname, '..', 'public'));
  // app.setBaseViewsDir(join(__dirname, '..', 'views'));
  // app.setViewEngine('hbs');
  await app.listen(4444);
}
bootstrap();

// exeptions in websocket connection (disconnect, lost peer etc) / rewrite to rest api +
// optimizing comparizon +
// database save data +
// adding timestemp to prices
// configure logging
// write logging
//

// commissions for price 

// в моменте різниця в відсотках
// -------------основа WHITEBIT --- KRAKEN, BITSTAMP
// USDT > EUR ціна    %                   %
// EUR > USDT ціна    %                   %
// кожні 30 секунд

//
//bitstamp
// \t  \n
// привести до одної валюти 


//табличка пів години 10 хвилин як відрізняється

// поділ по дням


// react server