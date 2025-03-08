import { networkInterfaces } from 'os';

/**
 * The port number for the gRPC server.
 *
 * This value is retrieved from the environment variable `GRPC_PORT`.
 * If the environment variable is not set, it defaults to `50051`.
 *
 * @constant
 * @type {number}
 */
const grpcPort: number = Number(process.env.GRPC_PORT) || 50051;

/**
 * Retrieves the local IPv4 address of the machine.
 *
 * This function iterates over the network interfaces of the machine and returns
 * the first non-internal IPv4 address it finds. If no such address is found,
 * it defaults to returning '127.0.0.1'.
 *
 * @returns {string} The local IPv4 address or '127.0.0.1' if no external address is found.
 */
const getLocalIp = (): string => {
  const nets = networkInterfaces();

  for (const iface of Object.values(nets)) {
    for (const net of iface!) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return '127.0.0.1';
};

/**
 * Retrieves the gRPC talkback endpoint URL.
 *
 * This function constructs the gRPC talkback endpoint URL based on the environment configuration.
 * If the `SERVICE_FQDN` environment variable is set, it uses that value as the hostname.
 * Otherwise, it falls back to using the local IP address.
 *
 * @returns {string} The gRPC talkback endpoint URL.
 */
const getGrpcTalkbackEndpoint = (): string => {
  if (process.env.SERVICE_FQDN) {
    return `http://${process.env.SERVICE_FQDN}:${grpcPort}`;
  }

  const ip = getLocalIp();
  return `http://${ip}:${grpcPort}`;
};

export { getGrpcTalkbackEndpoint, grpcPort };
