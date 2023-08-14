export const stepIntervals = {
  seconds: 1,
  min: 2,
  mins: 2,
  hour: 120,
  hours: 120,
  day: 120 * 24,
  days: 120 * 24,
};
export interface graphRecord {
  datetime: string;
  whitebitPrice: number;
  bitstampPrice: number;
  krakenPrice: number;
  diffWhiteBitstamp: string;
  diffWhiteKraken: string;
}

export interface tableRecord {
  datetime: string;
  whitebitPrice: number;
  toExchangePrice: number;
  difference: string;
}
