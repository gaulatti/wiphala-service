import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
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
  exports: [ClientsModule],
  controllers: [OrchestratorController],
})
export class OrchestratorModule {}
