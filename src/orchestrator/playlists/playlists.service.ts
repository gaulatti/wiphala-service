import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Logger } from 'src/decorators/logger.decorator';
import { Context, Playlist, PlaylistStatus } from 'src/models/playlist.model';
import { Strategy } from 'src/models/strategy.model';
import { JSONLogger } from 'src/utils/logger';
import { nanoid } from '../../utils/nanoid';
import { PlaylistRequest, PlaylistResponse } from '../orchestrator.controller';
import { PluginsService } from '../plugins/plugins.service';
import { StrategiesService } from '../strategies/strategies.service';

/**
 * Service responsible for managing and processing playlists.
 *
 * This service provides methods to monitor scheduled triggers, start playlists based on strategies,
 * and run playlists by executing their sequence of slots.
 *
 * @class
 */
@Injectable()
export class PlaylistsService {
  /**
   * Logger instance for logging messages.
   */
  @Logger(PlaylistsService.name)
  private readonly logger!: JSONLogger;

  /**
   * Constructs an instance of the PlaylistsService.
   *
   * @param pluginsService - The injected PluginsService used for plugin operations.
   * @param strategiesService - The injected StrategiesService used for strategy operations.
   * @param playlist - The injected Playlist model used for database operations.
   */
  constructor(
    @Inject(forwardRef(() => PluginsService))
    private readonly pluginsService: PluginsService,
    private readonly strategiesService: StrategiesService,
    @InjectModel(Playlist) private readonly playlist: typeof Playlist,
  ) {}

  /**
   * Retrieves a list of playlists along with the total count.
   *
   * @returns {Promise<{ rows: Playlist[]; count: number }>} A promise that resolves to an object containing an array of playlists and the total count.
   */
  async getPlaylists(): Promise<{ rows: Playlist[]; count: number }> {
    return this.playlist.findAndCountAll({
      include: [{ model: Strategy }],
      distinct: true,
    });
  }

  /**
   * Retrieves a playlist by its slug.
   *
   * @param {string} slug - The unique identifier for the playlist.
   * @returns {Promise<Playlist | null>} A promise that resolves to the playlist object if found, or null if not found.
   */
  async getPlaylist(slug: string): Promise<Playlist | null> {
    return this.playlist.findOne({ where: { slug } });
  }

  /**
   * Triggers the playlist based on the provided strategy.
   *
   * @param {PlaylistRequest} data - The request data containing the strategy slug and context.
   * @returns {Promise<PlaylistResponse>} - A promise that resolves to the playlist response containing the slug and status.
   * @throws {Error} - Throws an error if the strategy with the provided slug does not exist.
   */
  async trigger(data: PlaylistRequest): Promise<PlaylistResponse> {
    const { slug: strategySlug, context } = data;

    const strategy = await this.strategiesService.findBySlug(strategySlug);

    /**
     * Throw an error if the strategy does not exist.
     */
    if (!strategy) {
      throw new Error(`Strategy with slug ${strategySlug} not found.`);
    }

    /**
     * Start the playlist based on the provided strategy.
     */
    const { slug, status } = await this.start(strategy, context);

    return {
      slug,
      status,
    };
  }

  /**
   * Starts a playlist based on the provided strategy and context.
   *
   * @param strategy - The strategy object containing slots and other configuration details.
   * @param context - An optional object providing additional context for the playlist.
   * @returns A promise that resolves when the playlist has been started.
   *
   * @remarks
   * This method performs the following steps:
   * 1. Generates the playlist manifest by organizing slots based on their plugin types and order.
   * 2. Creates a new playlist entry in the database with the generated manifest and initial status.
   * 3. Initiates the execution of the playlist.
   */
  private async start(
    strategy: Strategy,
    metadata: object = {},
  ): Promise<Playlist> {
    const context: Context = {
      metadata,
      sequence: strategy.slots,
    };

    const playlist = await this.playlist.create({
      strategies_id: strategy.id,
      context,
      status: PlaylistStatus.CREATED,
      slug: nanoid(),
      current_slot_id: strategy.root_slot,
    });

    await this.run(playlist);

    return playlist;
  }

  /**
   * Runs the given playlist by updating its status to 'RUNNING' and calling the next method on the plugins service.
   *
   * @param playlist - The playlist to be run.
   * @returns A promise that resolves when the playlist status is updated and the next method is called.
   */
  private async run(playlist: Playlist) {
    /**
     * Update the playlist status to 'RUNNING'.
     */
    if (playlist.status !== PlaylistStatus.RUNNING) {
      await playlist.update({ status: PlaylistStatus.RUNNING });
    }

    /**
     * Call the `next` method on the `pluginsService` with the playlist.
     */
    await this.pluginsService.run(playlist);
  }

  /**
   * Updates the status of the given playlist to 'FAILED' and sets the updatedAt timestamp to the current date.
   *
   * @param {Playlist} playlist - The playlist to be updated.
   * @returns {Promise<Playlist>} A promise that resolves to the updated playlist.
   */
  async crash(playlist: Playlist): Promise<Playlist> {
    return playlist.update({
      status: PlaylistStatus.FAILED,
      updatedAt: new Date(),
    });
  }
}
