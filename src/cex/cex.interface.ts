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

export interface tableRecord {
  datetime: string;
  whitebitPrice: number;
  toExchangePrice: number;
  difference: string;
}
