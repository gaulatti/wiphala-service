import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Plugin } from './plugin.model';
import { Strategy } from './strategy.model';

@Table({ tableName: 'slots', timestamps: true, underscored: true })
export class Slot extends Model<Slot> {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Strategy)
  @Column({ allowNull: false })
  strategies_id: number;

  @BelongsTo(() => Strategy)
  strategy: Strategy;

  @ForeignKey(() => Plugin)
  @Column({ allowNull: false })
  plugins_id: number;

  @BelongsTo(() => Plugin)
  plugin: Plugin;

  @Column({ type: DataType.JSON })
  metadata: object;

  @Column({ type: DataType.JSON })
  conditions: object;

  @Column({ type: DataType.INTEGER, allowNull: true })
  default_next_slot_id?: number;

  @Column({ defaultValue: 0 })
  min_outputs: number;

  @Column({ defaultValue: 0 })
  max_retries: number;

  /**
   * This is for playlist-only usage. It won't be stored in the slots table
   * but it will be stored in every playlist context.
   */
  output: any;
}
