import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebSocketGatewayServer } from './websocket.gateway';
import { MatchModel } from '~/database/models/MatchModel';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([MatchModel]), UserModule],
  providers: [WebSocketGatewayServer],
})
export class GatewayModule {}
