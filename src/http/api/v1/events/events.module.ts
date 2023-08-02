import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FindMyMatchesGateway } from './findMyMatches.gateway';

@Module({
  imports: [],
  providers: [FindMyMatchesGateway],
})
export class EventsModule {}
