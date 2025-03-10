import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Slot } from './slot.model';

export type PlaylistContextDocument = PlaylistContext & Document;

@Schema({ collection: 'playlists' })
export class PlaylistContext {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true, type: Object })
  metadata: Record<string, any>;

  @Prop({ required: false, type: Object })
  sequence: Slot[];

  @Prop({ required: true, type: String })
  origin: string;
}

export const PlaylistContextSchema =
  SchemaFactory.createForClass(PlaylistContext);
