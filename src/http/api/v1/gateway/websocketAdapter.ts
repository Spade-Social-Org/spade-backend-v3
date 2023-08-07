import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { jwtConstants } from '~/constant/authConstants';
import { AuthenticatedSocket } from './gateway.interface';
import { NotAuthorizedAppException } from '~/http/exceptions/NotAuthorizedAppException';
import { ResponseMessage } from '~/constant/ResponseMessageEnums';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);
  constructor(private app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    // const clientPort = parseInt(this.configService.get('CLIENT_PORT'));

    // const cors = {
    //   origin: [
    //     `http://localhost:${clientPort}`,
    //     new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`),
    //   ],
    // };

    // this.logger.log('Configuring SocketIO server with custom CORS options', {
    //   cors,
    // });

    // const optionsWithCORS: ServerOptions = {
    //   ...options,
    //   cors,
    // };

    const jwtService = this.app.get(JwtService);
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: true,
    });

    server.use(async (socket: AuthenticatedSocket, next) => {
      const token = this.extractTokenFromHeader(socket);
      if (!token) {
        next(new NotAuthorizedAppException(ResponseMessage.USER_UNAUTHORIZED));
        return;
      }

      try {
        const payload = await jwtService.verifyAsync(token, {
          secret: jwtConstants.secret,
        });
        socket.user = payload;
      } catch {
        next(new NotAuthorizedAppException(ResponseMessage.USER_UNAUTHORIZED));
      }

      next();
    });

    return server;
  }
  private extractTokenFromHeader(
    request: AuthenticatedSocket,
  ): string | undefined {
    const [type, token] =
      request.handshake?.headers.authorization?.split(' ') ?? [];

    if (!type || !token) return undefined;
    return type.toLowerCase() === 'bearer' ? token : undefined;
  }
}

// const createTokenMiddleware =
//   (jwtService: JwtService, logger: Logger) => (socket: any, next: any) => {
//     // for Postman testing support, fallback to token header
//     const token =
//       socket.handshake.auth.token || socket.handshake.headers['token'];

//     logger.debug(`Validating auth token before connection: ${token}`);

//     try {
//       const payload = jwtService.verify(token);
//       console.log({ payload });
//       next();
//     } catch {
//       next(new Error('FORBIDDEN'));
//     }
//   };
