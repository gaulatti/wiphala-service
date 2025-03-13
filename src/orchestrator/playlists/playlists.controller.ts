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

  @Get()
  /**
   * Retrieves a paginated list of playlists.
   *
   * @param {number} page - The page number to retrieve.
   * @param {number} pageSize - The number of playlists per page.
   * @returns {Promise<{ rows: Playlist[]; count: number }>} A promise that resolves to an object containing the playlists and the total count.
   */
  async getPlaylists(
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ): Promise<{ rows: Playlist[]; count: number }> {
    return this.playlistService.getPlaylists(page, pageSize);
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
