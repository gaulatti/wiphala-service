import { Column, DataType, Index, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'plugins', timestamps: true, underscored: true })
export class Plugin extends Model<Plugin> {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Index
  @Column({ allowNull: false })
  team_id: number;

  @Column({ allowNull: false, type: DataType.STRING(100) })
  name: string;

  @Column({ type: DataType.TEXT })
  description?: string;

  @Column({ allowNull: false })
  grpc_host: string;

  @Column({ allowNull: false })
  grpc_port: number;

  @Index({ unique: true })
  @Column({ allowNull: false, unique: true })
  plugin_key: string;

  @Index({ unique: true })
  @Column({ allowNull: false, unique: true })
  slug: string;
}
