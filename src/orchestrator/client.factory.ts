import { credentials, loadPackageDefinition } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { Injectable } from '@nestjs/common';
import { join } from 'path';

export interface ClientService {
  deliver(
    data: { payload: string },
    callback: (err: any, res: { success: boolean; result: string }) => void,
  ): void;
}

export interface WorkerService {
  performTask(
    data: { payload: string },
    callback: (err: any, res: { success: boolean; result: string }) => void,
  ): void;
}

@Injectable()
export class ClientFactory {
  /**
   * Creates a gRPC client for the specified service.
   *
   * @template T - The type of the gRPC client.
   * @param {string} host - The host address of the gRPC server.
   * @param {number} port - The port number of the gRPC server.
   * @param {string} protoFile - The name of the proto file defining the service.
   * @param {string} packageName - The package name defined in the proto file.
   * @param {string} serviceName - The service name defined in the proto file.
   * @returns {T} - An instance of the gRPC client.
   */
  createClient<T>(
    host: string,
    port: number,
    protoFile: string,
    packageName: string,
    serviceName: string,
  ): T {
    /**
     * Load the proto file and create the gRPC client.
     */
    const protoPath = join(__dirname, 'proto', protoFile);

    /**
     * Load the proto file and create the gRPC client.
     */
    const packageDefinition = loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    /**
     * Load the proto file and create the gRPC client.
     */
    const grpcObject = loadPackageDefinition(packageDefinition) as any;
    const service = grpcObject[packageName][serviceName];

    /**
     * Create the gRPC client.
     */
    const client = new service(`${host}:${port}`, credentials.createInsecure());

    return client as T;
  }
}
