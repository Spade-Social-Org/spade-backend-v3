import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  Repository,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { AuthenticatedSocket } from './gateway.interface';
import { MatchModel } from '~/database/models/MatchModel';
import { UserService } from '../user/user.service';
import { UpdateUserProfileDto } from '../user/user.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebSocketGatewayServer
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @InjectRepository(MatchModel)
    private matchRepository: Repository<MatchModel>,
    private userService: UserService,
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('joinRoom')
  handleJoin(client: Socket, slug: string) {
    client.join(slug);
    this.logger.log(`Client id: ${slug}`);
  }
  @SubscribeMessage('message.private')
  handlePrivateMessage(client: Socket, { content, to }: any) {
    console.log(content, to);
    this.server.to(to).emit('message.private', content);
  }
  @SubscribeMessage('message.location')
  async handleShareLocation(
    client: AuthenticatedSocket,
    { longitude, latitude }: any,
  ) {
    const userId = client.user.userId;
    const [user, matches] = await Promise.all([
      this.userService.updateUserProfile(
        { latitude, longitude } as UpdateUserProfileDto,
        userId,
      ),
      this.matchRepository.find({
        where: [{ user_id_1: userId }, { user_id_2: userId }],
      }),
    ]);

    matches.forEach((match) => {
      this.server
        .to(userId ? match.user_id_2.toString() : match.user_id_1.toString())
        .emit('message.location', user);
    });
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: AuthenticatedSocket) {
    console.log(client.user);
    client.join(client.user.userId);
    this.logger.log(`Client connected:`, client.user);
  }
}
