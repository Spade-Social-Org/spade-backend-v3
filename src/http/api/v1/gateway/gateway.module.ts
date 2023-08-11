import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebSocketGatewayServer } from './websocket.gateway';
import { MatchModel } from '~/database/models/MatchModel';
import { UserModule } from '../user/user.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [TypeOrmModule.forFeature([MatchModel]), UserModule, MessageModule],
  providers: [WebSocketGatewayServer],
})
export class GatewayModule {}
