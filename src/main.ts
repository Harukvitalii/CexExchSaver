import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(4444);
}
bootstrap();



// exeptions in websocket connection (disconnect, lost peer etc)
// optimizing comparizon
// database save data
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
