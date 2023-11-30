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
import { PostService } from '../post/post.service';

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
    private postService: PostService,
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
    { content, receiver_id, post_id, parent_message_id }: any,
  ) {
    console.log({ content, receiver_id, post_id, parent_message_id });
    if (!client.user) return;
    const message = await this.messageService.create({
      content,
      sender_id: client.user.userId,
      receiver_id,
      post_id,
      parent_message_id,
    });
    let post;
    let parentMessage;
    if (post_id) {
      post = await this.postService.findOne(post_id);
    }
    if (parent_message_id) {
      parentMessage = await this.messageService.findOne(parent_message_id);
    }
    this.server.to(`client-${receiver_id}`).emit('message.private', {
      content,
      message_id: message?.id,
      sender_id: client.user.userId,
      name: client.user.name,
      post,
      parentMessage,
    });
    this.server.to(`client-${client.user.userId}`).emit('message.private', {
      content,
      message_id: message?.id,
      sender_id: client.user.userId,
      name: client.user.name,
      post,
      parentMessage,
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
    this.logger.log(`Client disconnected: ${client?.id}`);
  }

  handleConnection(client: AuthenticatedSocket) {
    console.log(client?.user);
    client.join(`client-${client?.user?.userId}`);
    this.logger.log(`Client connected:`, client?.user);
  }
}
