import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class priceRecord extends Model {
  @Column({
    allowNull: false,
  })
  timeAdded: number;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
  })
  symbol: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  price: number;
}
