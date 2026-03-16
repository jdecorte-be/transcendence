import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Socket } from 'socket.io';
import * as http from 'http';
export class GatewayAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.use((client: Socket, next) => {
      const authUserId =
        (typeof client.handshake.auth?.userId === 'string'
          ? client.handshake.auth.userId
          : undefined) ||
        (typeof client.handshake.query?.userId === 'string'
          ? client.handshake.query.userId
          : undefined);

      if (!authUserId) {
        return next(new Error('Unauthorized'));
      }

      client.data.user = { sub: authUserId };
      console.debug('WS auth ok', { userId: authUserId, source: 'handshake' });
      return next();
    });
    return server;
  }
}
