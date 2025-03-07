import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { CoreModule } from 'src/core/core.module';
import { DalModule } from 'src/dal/dal.module';
import { ClientFactory } from './client.factory';
import { OrchestratorController } from './orchestrator.controller';
import { PlaylistsController } from './playlists/playlists.controller';
import { PlaylistsService } from './playlists/playlists.service';
import { PluginsController } from './plugins/plugins.controller';
import { PluginsService } from './plugins/plugins.service';
import { StrategiesController } from './strategies/strategies.controller';
import { StrategiesService } from './strategies/strategies.service';

@Module({
  imports: [
    DalModule,
    CoreModule,
    AuthorizationModule,
    ClientsModule.register([
      {
        name: 'orchestrator',
        transport: Transport.GRPC,
        options: {
          package: 'orchestrator',
          protoPath: join(__dirname, './proto/orchestrator.proto'),
        },
      },
    ]),
  ],
  exports: [ClientsModule, ClientFactory],
  providers: [
    ClientFactory,
    PlaylistsService,
    PluginsService,
    StrategiesService,
  ],
  controllers: [
    OrchestratorController,
    PlaylistsController,
    PluginsController,
    StrategiesController,
  ],
})
export class OrchestratorModule {}
