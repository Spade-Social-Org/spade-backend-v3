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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebSocketGatewayServer
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  //   constructor() {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('joinRoom')
  handleJoin(client: Socket, slug: string) {
    client.join(slug);
    this.logger.log(`Client id: ${slug}`);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    console.log(client);
    this.logger.log(`Client connected:`, client);
  }
}
