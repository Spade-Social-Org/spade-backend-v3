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
import { MessageService } from '../message/message.service';

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
    private messageService: MessageService,
    private userService: UserService,
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('')
  handleJoin(client: Socket, slug: string) {
    client.join(slug);
    this.logger.log(`Client id: ${slug}`);
  }
  @SubscribeMessage('message.private')
  async handlePrivateMessage(
    client: AuthenticatedSocket,
    { content, receiver_id }: any,
  ) {
    console.log({ content, receiver_id });
    const message = await this.messageService.create({
      content,
      sender_id: client.user.userId,
      receiver_id,
    });
    this.server.to(`client-${receiver_id}`).emit('message.private', {
      content,
      sender_id: client.user.userId,
      name: client.user.name,
    });
  }
  @SubscribeMessage('message.location')
  async handleShareLocation(
    client: AuthenticatedSocket,
    { longitude, latitude }: any,
  ) {
    const room = 'message.location.changed';
    client.join(room);
    const userId = client.user.userId;
    const user = await this.userService.updateUserProfile(
      { latitude, longitude } as UpdateUserProfileDto,
      userId,
    );

    this.server
      .to(room)
      .emit('message.location', { user, latitude, longitude });
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: AuthenticatedSocket) {
    console.log(client.user);
    client.join(`client-${client.user.userId}`);
    this.logger.log(`Client connected:`, client.user);
  }
}
