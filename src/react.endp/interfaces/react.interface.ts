export const stepIntervals = {
  seconds: 1,
  min: 2,
  mins: 2,
  hour: 120,
  hours: 120,
  day: 120 * 24,
  days: 120 * 24,
};
export interface calculatedRecord {
  datetime: string;
  whitebitPrice: number;
  bitstampPrice: number;
  krakenPrice: number;
  diffMainBitstamp: string;
  diffMainKraken: string;
  diffMainWhitebit: string;
}

export interface tableRecord {
  datetime: string;
  whitebitPrice: number;
  toExchangePrice: number;
  difference: string;
}

export interface graphQuery {
  startData: string;
  endData: string;
  step: string;
  mainExchange: string;
}

export interface tableQuery {
  startData: string;
  endData: string;
  step: string;
  sort: string;
  mainExchange: string;
}
