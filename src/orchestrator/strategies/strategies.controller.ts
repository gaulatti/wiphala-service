import { Controller, Get, Param } from '@nestjs/common';
import { Logger } from 'src/decorators/logger.decorator';
import { Strategy } from 'src/models/strategy.model';
import { JSONLogger } from 'src/utils/logger';
import { StrategiesService } from './strategies.service';

@Controller('strategies')
export class StrategiesController {
  constructor(private readonly strategiesService: StrategiesService) {}

  /**
   * Logger instance for logging messages.
   */
  @Logger(StrategiesController.name)
  private readonly logger!: JSONLogger;

  /**
   * Retrieves a list of strategies.
   *
   * @returns {Promise<{ rows: Strategy[]; count: number }>} A promise that resolves to the list of strategies.
   */
  @Get()
  getStrategies(): Promise<{ rows: Strategy[]; count: number }> {
    return this.strategiesService.getStrategies();
  }

  /**
   * Retrieves a strategy based on the provided slug.
   *
   * @param slug - The unique identifier for the strategy.
   * @returns The strategy associated with the given slug.
   */
  @Get(':slug')
  getStrategy(@Param('slug') slug: string) {
    return this.strategiesService.getStrategy(slug);
  }
}
