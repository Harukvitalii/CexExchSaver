export interface ExchangeFees {
  [exchangeName: string]: {
    buy: number;
    sell: number;
  };
}
export interface pairToSub {
  [exchangeName: string]: {
    reverse: boolean;
  };
}

export interface pairToSubDict {
  [name: string]: pairToSub;
}
export interface cexPairs {
  [name: string]: Record<string, Record<string, number>>;
}
export const stepIntervals = {
  seconds: 1,
  min: 2,
  mins: 2,
  hour: 120,
  hours: 120,
  day: 120 * 24,
  days: 120 * 24,
};
