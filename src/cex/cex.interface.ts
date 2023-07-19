export interface ExchangeFees {
  [exchangeName: string]: {
    buy: number;
    sell: number;
  };
}
