import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Logger } from 'src/decorators/logger.decorator';
import { PlaylistContextDocument } from 'src/models/playlist.context';
import { Playlist } from 'src/models/playlist.model';
import { Plugin } from 'src/models/plugin.model';
import { JSONLogger } from 'src/utils/logger';
import { getGrpcTalkbackEndpoint } from 'src/utils/network';
import { ClientFactory, WorkerService } from '../client.factory';

/**
 * Service responsible for processing plugins in a playlist sequence.
 */
@Injectable()
export class PluginsService {
  constructor(
    private readonly clientFactory: ClientFactory,
    @InjectModel(Plugin) private readonly plugin: typeof Plugin,
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

  /**
   * Invokes a plugin by communicating with the worker service.
   *
   * @param {Plugin} plugin - The plugin to be invoked, containing gRPC host and port information.
   * @param {object} payload - The payload to be sent to the worker service.
   * @returns {Promise<any>} - A promise that resolves with the response from the worker service or rejects with an error.
   */
  async invokePlugin(plugin: Plugin, payload: object): Promise<any> {
    const client = this.clientFactory.createClient<WorkerService>(
      plugin.grpc_host,
      plugin.grpc_port,
      'worker.proto',
      'worker',
      'WorkerService',
    );

    if (!client) {
      this.logger.error('❌ Failed to create gRPC client, skipping request.');
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        client.performTask(
          { payload: JSON.stringify(payload) },
          (err, response) => {
            if (err) {
              this.logger.error(`⚠️ gRPC request failed: ${err.message}`);
              reject(new Error(`gRPC request failed: ${err.message}`));
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

  /**
   * Executes the plugin associated with the current slot in the playlist.
   *
   * @param playlist - The playlist object containing the sequence and current slot information.
   * @throws {Error} If the current slot is not found in the playlist sequence.
   */
  async run(playlist: Playlist, context: PlaylistContextDocument) {
    /**
     * Get the plugin from the sequence.
     */
    const current = context.sequence.find(
      (item) => item.id === playlist.current_slot_id,
    );

    if (!current) {
      throw new Error('Current slot not found');
    }

    try {
      await this.invokePlugin(current.plugin, {
        playlist,
        context,
        talkback: getGrpcTalkbackEndpoint(),
      });
    } catch (error) {
      this.logger.error('Error invoking plugin:', error);
    }
  }
}
