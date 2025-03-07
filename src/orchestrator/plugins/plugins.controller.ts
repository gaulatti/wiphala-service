import { Controller, Get, Param } from '@nestjs/common';
import { Logger } from 'src/decorators/logger.decorator';
import { Plugin } from 'src/models/plugin.model';
import { JSONLogger } from 'src/utils/logger';
import { PluginsService } from './plugins.service';

@Controller('plugins')
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  /**
   * Logger instance for logging messages.
   */
  @Logger(PluginsController.name)
  private readonly logger!: JSONLogger;

  /**
   * Retrieves the list of plugins.
   *
   * @returns {Promise<Promise<{ rows: Plugin[]; count: number }>>} A promise that resolves to an array of plugins.
   */
  @Get()
  async getPlugins(): Promise<Promise<{ rows: Plugin[]; count: number }>> {
    return this.pluginsService.getPlugins();
  }

  /**
   * Retrieves a plugin based on the provided slug.
   *
   * @param {string} slug - The unique identifier for the plugin.
   * @returns The plugin corresponding to the given slug.
   */
  @Get(':slug')
  getPlugin(@Param('slug') slug: string) {
    return this.pluginsService.getPlugin(slug);
  }
}
