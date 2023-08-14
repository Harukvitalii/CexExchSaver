import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressBodyParserOptions } from '@nestjs/platform-express';
import { join } from 'path';

// ./src/main.ts

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
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

//  пік в 31 число 10 годин
// злом в 31 число 20 годин
// наверх 01 число 20 годин
// вниз   02 число 13 годин
// в кінець до 03 14 годни


// граф оновленя при виборі кроку
// pf,hfnb вайтбіт ціні, дататайм,

// добавити зеленим де ціна вигідніша

// добавити сторінку де найвигідніше робити обмін