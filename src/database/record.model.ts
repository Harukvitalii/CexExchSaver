import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class Record extends Model<Record> {
  @Column({
    allowNull: false,
    unique: true,
  })
  transactionHash: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  from: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  to: string;

  @Column({ defaultValue: true })
  isAvailable: boolean;
}
