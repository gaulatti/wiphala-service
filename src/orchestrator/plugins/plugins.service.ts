import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Logger } from 'src/decorators/logger.decorator';
import { Playlist } from 'src/models/playlist.model';
import { Plugin } from 'src/models/plugin.model';
import { JSONLogger } from 'src/utils/logger';
import { PlaylistsService } from '../playlists/playlists.service';

/**
 * Service responsible for processing plugins in a playlist sequence.
 */
@Injectable()
export class PluginsService {
  constructor(
    @InjectModel(Plugin) private readonly plugin: typeof Plugin,
    @Inject(forwardRef(() => PlaylistsService))
    private readonly playlistsService: PlaylistsService,
  ) {}

  /**
   * Logger instance for logging messages.
   */
  @Logger(PluginsService.name)
  private readonly logger!: JSONLogger;

  /**
   * Retrieves a list of plugins with a count of the total number of plugins.
   *
   * @returns {Promise<{ rows: Plugin[]; count: number }>} A promise that resolves to an object containing an array of plugins and the total count.
   */
  async getPlugins(): Promise<{ rows: Plugin[]; count: number }> {
    return this.plugin.findAndCountAll({
      distinct: true,
    });
  }

  /**
   * Retrieves a plugin by its slug.
   *
   * @param slug - The unique identifier for the plugin.
   * @returns A promise that resolves to the plugin object if found, or null if not found.
   */
  async getPlugin(slug: string): Promise<Plugin | null> {
    return this.plugin.findOne({ where: { slug } });
  }

  // TODO: Invoke plugins via gRPC.
  async next(playlist: Playlist) {
    return Promise.resolve(console.log({ playlist }));
  }
}
