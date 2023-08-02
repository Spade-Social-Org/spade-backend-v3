import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { TranslatorModule } from 'nestjs-translator';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './http/exceptions/exception-filter/HttpExceptionFilter';

import { BullModule } from '@nestjs/bullmq';

import dataSourceInstance from './database/connections/default';

import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from './config/throttle';

import validatorPipe from './config/validator';
import appConfig from './config/envs/app.config';

import databaseConfig from './config/envs/database.config';

import redisConfig from './config/envs/redis.config';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './http/api/v1/user/user.module';
import { AuthModule } from './http/api/v1/auth/auth.module';
import { PostModule } from './http/api/v1/post/post.module';
import { EventsModule } from './http/api/v1/events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', `${process.env.NODE_ENV}.env`, 'local.env'],
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      cache: true,
    }),
    LoggerModule.forRootAsync({
      inject: [appConfig.KEY],
      async useFactory(applicationConfig: ConfigType<typeof appConfig>) {
        const nodeEnv = applicationConfig.NODE_ENV;

        return {
          pinoHttp: {
            serializers: {
              req(req) {
                req.body = req.body || req.raw.body;
                return req;
              },
            },
            transport: {
              target: 'pino-pretty',
              options:
                nodeEnv === 'production'
                  ? undefined
                  : {
                      colorize: true,
                    },
            },
          },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      name: 'default',
      useFactory: () => ({}),
      dataSourceFactory: async () => {
        if (!dataSourceInstance.isInitialized) {
          await dataSourceInstance.initialize();
        }

        return dataSourceInstance;
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('app.THROTTLE_TTL'),
        limit: config.get('app.THROTTLE_LIMIT'),
      }),
    }),
    // BullModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     connection: {
    //       host: configService.get('REDIS_HOST'),
    //       port: +configService.get('REDIS_PORT'),
    //     },
    //   }),
    // }),
    // BullModule.registerQueue({
    //   name: 'sync',
    // }),
    TranslatorModule.forRoot({
      global: true,
      defaultLang: 'en',
      translationSource: '/src/i18n',
    }),
    SharedModule,
    UserModule,
    AuthModule,
    PostModule,
    EventsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_PIPE,
      useValue: validatorPipe,
    },
  ],
})
export class AppModule {}
