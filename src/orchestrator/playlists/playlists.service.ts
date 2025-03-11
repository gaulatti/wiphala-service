import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel as InjectMongooseModel } from '@nestjs/mongoose';
import { InjectModel as InjectSequelizeModel } from '@nestjs/sequelize';
import { Model } from 'mongoose';
import { Logger } from 'src/decorators/logger.decorator';
import {
  PlaylistContext,
  PlaylistContextDocument,
} from 'src/models/playlist.context';
import { Playlist, PlaylistStatus } from 'src/models/playlist.model';
import { Strategy } from 'src/models/strategy.model';
import { JSONLogger } from 'src/utils/logger';
import { getHostAndPort } from 'src/utils/network';
import { nanoid } from '../../utils/nanoid';
import { ClientFactory, ClientService } from '../client.factory';
import {
  PlaylistSegue,
  PlaylistSegueResponse,
  PlaylistTrigger,
  PlaylistTriggerResponse,
} from '../orchestrator.controller';
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
    private readonly clientFactory: ClientFactory,

    /**
     * The injected Playlist model used for database operations.
     */
    @InjectSequelizeModel(Playlist) private readonly playlist: typeof Playlist,

    /**
     * The injected PlaylistContext model used for database operations.
     */
    @InjectMongooseModel(PlaylistContext.name)
    private context: Model<PlaylistContextDocument>,
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
  async trigger(data: PlaylistTrigger): Promise<PlaylistTriggerResponse> {
    const { slug: strategySlug, context, origin } = data;

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
    const { slug, status } = await this.start(strategy, context, origin);

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
    metadata: any,
    origin: string,
  ): Promise<Playlist> {
    /**
     * Create a new playlist in the database.
     */
    const playlist = await this.playlist.create({
      strategies_id: strategy.id,
      status: PlaylistStatus.CREATED,
      slug: nanoid(),
      current_slot_id: strategy.root_slot,
    });

    /**
     * Create a new context for the playlist.
     */
    const context: PlaylistContextDocument = await this.context.create({
      id: playlist.id,
      metadata: JSON.parse(metadata),
      sequence: strategy.slots.map((slot) => slot.toJSON()),
      origin,
    });

    await this.run(playlist, context);

    return playlist;
  }

  /**
   * Runs the given playlist by updating its status to 'RUNNING' and calling the next method on the plugins service.
   *
   * @param playlist - The playlist to be run.
   * @returns A promise that resolves when the playlist status is updated and the next method is called.
   */
  private async run(playlist: Playlist, context: PlaylistContextDocument) {
    /**
     * Update the playlist status to 'RUNNING'.
     */
    if (playlist.status !== PlaylistStatus.RUNNING) {
      await playlist.update({ status: PlaylistStatus.RUNNING });
    }

    /**
     * Call the `next` method on the `pluginsService` with the playlist.
     */
    await this.pluginsService.run(playlist, context);
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

  /**
   * Handles the segue operation for a playlist.
   *
   * This method retrieves the playlist by its slug, updates the context with the output from the segue,
   * sets the next step in the playlist, and continues the playlist execution if applicable.
   *
   * @param {PlaylistSegue} param0 - An object containing the slug of the playlist and the output to update.
   * @returns {Promise<PlaylistSegueResponse>} - A promise that resolves to a response indicating the success of the operation.
   * @throws {Error} - Throws an error if the playlist does not exist or if any other error occurs during the operation.
   */
  async segue({ slug, output }: PlaylistSegue): Promise<PlaylistSegueResponse> {
    try {
      /**
       * Retrieve the playlist by its slug.
       */
      const playlist = await this.getPlaylist(slug);

      /**
       * Throw an error if the playlist does not exist.
       */
      if (!playlist) {
        throw new Error(`Playlist with slug ${slug} not found.`);
      }

      const context = await this.context.findOne({ id: playlist.id });
      if (!context) {
        throw new Error(`Context for playlist with slug ${slug} not found.`);
      }

      /**
       * Get the current slot in the playlist.
       */
      const currentSlot = context.sequence.findIndex(
        (item) => item.id === playlist.current_slot_id,
      );

      /**
       * Update the context with the output from the segue.
       */
      context.sequence[currentSlot].output = JSON.parse(output);
      context.markModified(`sequence.${currentSlot}.output`);
      await context.save();

      /**
       * Set the next step in the playlist.
       *
       * If the next slot is null, mark the playlist as complete.
       */
      const nextSlot = context.sequence[currentSlot].default_next_slot_id;
      playlist.current_slot_id = nextSlot;
      if (nextSlot === null) {
        playlist.status = PlaylistStatus.COMPLETE;
      }

      /**
       * Update the last executed slot in the playlist's manifest.
       */
      playlist.updatedAt = new Date();
      /**
       * Update the last executed slot in the playlist's manifest.
       */
      await playlist.save();

      /**
       * Continue the playlist execution.
       */
      if (nextSlot !== null) {
        await this.run(playlist, context);
      }

      /**
       * Return to Sender.
       */
      this.deliver(playlist, context);

      /**
       * Return a success response.
       */
      return { success: true };
    } catch (error) {
      this.logger.error('Fatal on Segue:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /**
   * Delivers the given playlist to the client service.
   *
   * @param {Playlist} playlist - The playlist to be delivered.
   * @returns {Promise<any>} A promise that resolves with the response from the client service or rejects with an error.
   *
   * @throws {Error} If there is an error during the delivery process.
   */
  async deliver(
    playlist: Playlist,
    context: PlaylistContextDocument,
  ): Promise<any> {
    const { hostname, port } = getHostAndPort(context.origin);

    /**
     * Create a new client to communicate with the client service.
     */
    const client = this.clientFactory.createClient<ClientService>(
      hostname,
      port,
      'client.proto',
      'client',
      'ClientService',
    );

    if (!client) {
      this.logger.error('❌ Failed to create gRPC client, skipping delivery.');
      return null;
    }

    /**
     * Deliver the payload to the client service.
     */
    return new Promise((resolve, reject) => {
      try {
        client.deliver(
          { payload: JSON.stringify(playlist) },
          (err, response) => {
            if (err) {
              this.logger.error(`⚠️ gRPC delivery failed: ${err.message}`);
              reject(new Error(`gRPC delivery failed: ${err.message}`));
            } else {
              resolve(response);
            }
          },
        );
      } catch (error) {
        this.logger.error(`⚠️ Unexpected gRPC error: ${error.message}`);
        reject(new Error(error.message));
      }
    }).catch((error) => {
      this.logger.error(
        `⚠️ Gracefully handling gRPC failure: ${error.message}`,
      );
      return null;
    });
  }
}
