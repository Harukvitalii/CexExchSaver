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
