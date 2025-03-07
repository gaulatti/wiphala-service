import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PlaylistsService } from './playlists/playlists.service';

/**
 * The data required to trigger a playlist.
 */
export interface PlaylistRequest {
  slug: string;
  context: object;
}

/**
 * The response of a triggered playlist.
 */
export interface PlaylistResponse {
  slug: string;
  status: string;
}

@Controller()
export class OrchestratorController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  /**
   * Triggers a playlist based on the provided data.
   *
   * @param {PlaylistRequest} data - The data required to trigger the playlist.
   * @returns {Promise<PlaylistResponse>} A promise that resolves to the response of the triggered playlist.
   */
  @GrpcMethod('OrchestratorService', 'TriggerPlaylist')
  async triggerPlaylist(data: PlaylistRequest): Promise<PlaylistResponse> {
    return await this.playlistsService.trigger(data);
  }
}
