import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ClientFactory } from './client.factory';
import { OrchestratorController } from './orchestrator.controller';

@Module({
  imports: [
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
  providers: [ClientFactory],
  controllers: [OrchestratorController],
})
export class OrchestratorModule {}
