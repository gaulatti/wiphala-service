import { Column, DataType, Index, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'strategies', timestamps: true, underscored: true })
export class Strategy extends Model<Strategy> {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Index
  @Column({ allowNull: false })
  team_id: number;

  @Column({ allowNull: false, type: DataType.STRING(100) })
  name: string;

  @Column({ type: DataType.TEXT })
  description?: string;

  @Index({ unique: true })
  @Column({ allowNull: false, type: DataType.STRING(255), unique: true })
  slug: string;
}
