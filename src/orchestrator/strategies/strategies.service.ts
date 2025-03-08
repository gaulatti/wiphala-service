import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Plugin } from 'src/models/plugin.model';
import { Slot } from 'src/models/slot.model';
import { Strategy } from 'src/models/strategy.model';

/**
 * Service for handling operations related to strategies.
 */
@Injectable()
export class StrategiesService {
  /**
   * Creates an instance of StrategiesService.
   *
   * @param {typeof Strategy} strategy - The injected Strategy model.
   */
  constructor(
    @InjectModel(Strategy) private readonly strategy: typeof Strategy,
  ) {}

  /**
   * Retrieves a list of strategies along with the total count.
   *
   * @returns {Promise<{ rows: Strategy[]; count: number }>} A promise that resolves to an object containing an array of strategies and the total count.
   */
  async getStrategies(): Promise<{ rows: Strategy[]; count: number }> {
    return this.strategy.findAndCountAll({
      distinct: true,
    });
  }

  /**
   * Retrieves a strategy by its slug.
   *
   * @param slug - The unique identifier for the strategy.
   * @returns A promise that resolves to the strategy object if found, or null if not found.
   */
  async getStrategy(slug: string) {
    return this.strategy.findOne({ where: { slug } });
  }

  /**
   * Finds a strategy by its ID.
   *
   * @param {number} id - The ID of the strategy to find.
   * @returns {Promise<Strategy | null>} A promise that resolves to the found strategy, or null if no strategy is found.
   */
  async findById(id: number): Promise<Strategy | null> {
    return this.strategy.findOne({
      where: { id },
      include: [{ model: Slot, include: [Plugin] }],
    });
  }

  /**
   * Finds a strategy by its slug.
   *
   * @param slug - The slug of the strategy to find.
   * @returns A promise that resolves to the found strategy or null if no strategy is found.
   */
  async findBySlug(slug: string): Promise<Strategy | null> {
    return this.strategy.findOne({
      where: { slug },
      include: [
        {
          model: Slot,
          include: [
            {
              model: Plugin,
              attributes: { exclude: ['plugin_key'] },
            },
          ],
        },
      ],
    });
  }
}
