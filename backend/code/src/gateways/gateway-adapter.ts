import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Socket } from 'socket.io';
import * as http from 'http';
import { JwtService } from '@nestjs/jwt';
import { JwtConsts } from 'src/auth/constants/constants';

export class GatewayAdapter extends IoAdapter {
  private jwtService = new JwtService({
    secret: JwtConsts.at_secret,
  });

  private parseCookies(rawCookieHeader?: string): Record<string, string> {
    if (!rawCookieHeader) {
      return {};
    }

    return rawCookieHeader.split(';').reduce((acc, cookie) => {
      const separatorIndex = cookie.indexOf('=');
      if (separatorIndex < 0) {
        return acc;
      }

      const key = cookie.slice(0, separatorIndex).trim();
      const value = cookie.slice(separatorIndex + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.use((client: Socket, next) => {
      const req = client.request as http.IncomingMessage;
      const cookies = this.parseCookies(req.headers.cookie);
      client.data.cookies = cookies;

      const accessToken =
        cookies['X-Access-Token'] ||
        cookies['X-Acces-Token'];

      if (!accessToken) {
        console.debug('WS auth failed: missing access token cookie');
        return next(new Error('Unauthorized'));
      }

      try {
        const decoded = this.jwtService.verify(accessToken);
        client.data.user = decoded;
        console.debug('WS auth ok', { userId: decoded?.sub });
      } catch (error) {
        console.debug('WS auth failed: invalid token');
        return next(new Error('Unauthorized'));
      }
      return next();
    });
    return server;
  }
}
