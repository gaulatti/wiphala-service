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

@Table({ tableName: 'playlists', timestamps: true, underscored: true })
export class Playlist extends Model<Playlist> {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Strategy)
  @Column({ allowNull: false })
  strategies_id: number;

  @BelongsTo(() => Strategy)
  strategy: Strategy;

  @Column({
    type: DataType.ENUM(...Object.values(PlaylistStatus)),
    defaultValue: PlaylistStatus.CREATED,
  })
  status: PlaylistStatus;

  @ForeignKey(() => Slot)
  @Column({ allowNull: true })
  current_slot_id?: number;

  @BelongsTo(() => Slot)
  current_slot?: Slot;

  @Column({ type: DataType.JSON })
  context: object;

  @Index({ unique: true })
  @Column({ allowNull: false, unique: true })
  slug: string;
}
