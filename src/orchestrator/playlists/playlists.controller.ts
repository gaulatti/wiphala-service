import { Controller, Get, Param } from '@nestjs/common';
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
   * Retrieves a list of playlists along with the total count.
   *
   * @returns {Promise<{ rows: Playlist[]; count: number }>} A promise that resolves to an object containing an array of playlists and the total count.
   */
  @Get()
  async getPlaylists(): Promise<{ rows: Playlist[]; count: number }> {
    return this.playlistService.getPlaylists();
  }

  /**
   * Retrieves a playlist based on the provided slug.
   *
   * @param {string} slug - The unique identifier for the playlist.
   * @returns {Promise<Playlist>} The playlist corresponding to the given slug.
   */
  @Get(':slug')
  async getPlaylist(@Param('slug') slug: string): Promise<Playlist | null> {
    return await this.playlistService.getPlaylist(slug);
  }
}
