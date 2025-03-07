import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Playlist } from 'src/models/playlist.model';
import { Plugin } from 'src/models/plugin.model';
import { Slot } from 'src/models/slot.model';
import { Strategy } from 'src/models/strategy.model';

@Module({
  imports: [SequelizeModule.forFeature([Playlist, Plugin, Slot, Strategy])],
  exports: [SequelizeModule],
  providers: [],
})
export class DalModule {}
