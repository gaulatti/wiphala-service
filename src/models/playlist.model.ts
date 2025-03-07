import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { Slot } from './slot.model';
import { Strategy } from './strategy.model';

export enum PlaylistStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
  COMPLETE = 'COMPLETE',
}

export type Context = {
  metadata: Record<string, any>;
  sequence: Slot[];
};

@Table({ tableName: 'playlists', timestamps: true, underscored: true })
export class Playlist extends Model<
  InferAttributes<Playlist>,
  InferCreationAttributes<Playlist>
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: CreationOptional<number>;

  @ForeignKey(() => Strategy)
  @Column({ type: DataType.INTEGER, allowNull: false })
  strategies_id: number;

  @BelongsTo(() => Strategy)
  strategy?: Strategy;

  @Column({
    type: DataType.ENUM(...Object.values(PlaylistStatus)),
    defaultValue: PlaylistStatus.CREATED,
  })
  status: PlaylistStatus;

  @ForeignKey(() => Slot)
  @Column({ type: DataType.INTEGER, allowNull: true })
  current_slot_id?: number;

  @BelongsTo(() => Slot)
  current_slot?: Slot;

  @Column({ type: DataType.JSON })
  context: Context;

  @Index({ unique: true })
  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  slug: string;

  @Column({ type: DataType.DATE })
  created_at: CreationOptional<Date>;

  @Column({ type: DataType.DATE })
  updated_at: CreationOptional<Date>;
}
