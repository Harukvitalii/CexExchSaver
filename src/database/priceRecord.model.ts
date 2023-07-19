import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class priceRecord extends Model {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  timeAdded: number;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
  })
  exchange: string;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
  })
  symbol: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  price: number;
}
