import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  PlaylistContext,
  PlaylistContextSchema,
} from 'src/models/playlist.context';
import { Playlist } from 'src/models/playlist.model';
import { Plugin } from 'src/models/plugin.model';
import { Slot } from 'src/models/slot.model';
import { Strategy } from 'src/models/strategy.model';
import { BackupService } from './backup/backup.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Playlist, Plugin, Slot, Strategy]),
    MongooseModule.forFeature([
      { name: PlaylistContext.name, schema: PlaylistContextSchema },
    ]),
  ],
  exports: [SequelizeModule, MongooseModule],
  providers: [BackupService],
})
export class DalModule {}
