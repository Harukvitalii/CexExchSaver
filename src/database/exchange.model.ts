import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class Exchange extends Model {
  @Column({
    type: DataType.STRING(64),
    unique: true,
  })
  address: string;

  @Column({ defaultValue: false })
  isContract: boolean;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    defaultValue: 0,
  })
  balance: string;
}
