import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { pathFromSrc } from '../utils/general';

const syncProcessorFile = pathFromSrc('queue/processors/SyncProcessor.js');

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          connection: {
            host: configService.get('REDIS_HOST'),
            port: +configService.get('REDIS_PORT'),
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'sync',
      processors: [
        {
          concurrency: 1,
          path: syncProcessorFile,
        },
      ],
    }),
  ],
  providers: [],
})
export class QueueModule {}
