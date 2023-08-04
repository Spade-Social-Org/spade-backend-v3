import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebSocketGatewayServer } from './websocket.gateway';

@Module({
  imports: [],
  providers: [WebSocketGatewayServer],
})
export class GatewayModule {}
