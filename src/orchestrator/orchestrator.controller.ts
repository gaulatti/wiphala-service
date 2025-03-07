import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

interface PlaylistRequest {
  strategy_id: string;
  context: string;
}

interface PlaylistResponse {
  playlist_id: string;
  status: string;
}

@Controller()
export class OrchestratorController {
  @GrpcMethod('OrchestratorService', 'TriggerPlaylist')
  triggerPlaylist(data: PlaylistRequest): PlaylistResponse {
    console.log({ data });
    const playlistId = 'generated-playlist-id'; // TODO: Replace with actual logic
    const status = 'CREATED';
    return { playlist_id: playlistId, status };
  }
}
