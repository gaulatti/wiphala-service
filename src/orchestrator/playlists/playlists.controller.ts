import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Logger } from 'src/decorators/logger.decorator';
import { Playlist } from 'src/models/playlist.model';
import { JSONLogger } from 'src/utils/logger';
import { PlaylistsService } from './playlists.service';

/**
 * Controller for handling playlist-related operations.
 */
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistService: PlaylistsService) {}

  /**
   * Logger instance for logging messages.
   */
  @Logger(PlaylistsController.name)
  private readonly logger!: JSONLogger;

  /**
   * Retrieves a paginated list of playlists with optional sorting.
   *
   * @param {number} page - The page number to retrieve.
   * @param {number} pageSize - The number of playlists per page.
   * @param {string} sort - The field to sort the playlists by.
   * @param {'asc' | 'desc'} order - The order of sorting, either ascending ('asc') or descending ('desc').
   * @returns {Promise<{ rows: Playlist[]; count: number }>} A promise that resolves to an object containing the list of playlists and the total count.
   */
  @Get()
  async getPlaylists(
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
    @Query('sort') sort: string,
    @Query('order') order: 'asc' | 'desc',
  ): Promise<{ rows: Playlist[]; count: number }> {
    return this.playlistService.getPlaylists(page, pageSize, sort, order);
  }

  /**
   * Retrieves a playlist by its slug.
   *
   * @param {string} slug - The slug of the playlist to retrieve.
   * @returns {Promise<object>} The playlist object combined with its context.
   * @throws {Error} If the playlist is not found.
   */
  @Get(':slug')
  async getPlaylist(@Param('slug') slug: string): Promise<object> {
    const playlist = (await this.playlistService.getPlaylist(slug))?.toJSON();

    if (playlist) {
      const context = await this.playlistService.getContext(playlist.id);

      return {
        playlist,
        context,
      };
    }

    throw new Error('Playlist not found');
  }
}
