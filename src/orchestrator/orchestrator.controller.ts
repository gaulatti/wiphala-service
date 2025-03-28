import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PlaylistsService } from './playlists/playlists.service';

/**
 * The data required to trigger a playlist.
 */
export interface PlaylistTrigger {
  slug: string;
  context: object;
  origin: string;
}

/**
 * The response of a triggered playlist.
 */
export interface PlaylistTriggerResponse {
  slug: string;
  status: string;
}

/**
 * The data required to segue to another playlist.
 */
export interface SegueRequest {
  slug: string;
  operation: string;
  output: string;
}

/**
 * The response of a playlist segue.
 */
export interface SegueResponse {
  success: boolean;
}

@Controller()
export class OrchestratorController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  /**
   * Triggers a playlist based on the provided data.
   *
   * @param {TriggerRequest} data - The data required to trigger the playlist.
   * @returns {Promise<PlaylistResponse>} A promise that resolves to the response of the triggered playlist.
   */
  @GrpcMethod('WiphalaService', 'Trigger')
  async triggerPlaylist(
    data: PlaylistTrigger,
  ): Promise<PlaylistTriggerResponse> {
    return await this.playlistsService.trigger(data);
  }

  @GrpcMethod('WiphalaService', 'Segue')
  async seguePlaylist(data: SegueRequest): Promise<SegueResponse> {
    return await this.playlistsService.segue(data);
  }
}
