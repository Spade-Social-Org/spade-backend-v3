import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TranslatorModule } from 'nestjs-translator';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './http/exceptions/exception-filter/HttpExceptionFilter';

import dataSourceInstance from './database/connections/default';

import validatorPipe from './config/validator';
import appConfig from './config/envs/app.config';

import databaseConfig from './config/envs/database.config';

import redisConfig from './config/envs/redis.config';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './http/api/v1/user/user.module';
import { AuthModule } from './http/api/v1/auth/auth.module';
import { PostModule } from './http/api/v1/post/post.module';
import { GatewayModule } from './http/api/v1/gateway/gateway.module';
import { MessageModule } from './http/api/v1/message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', `${process.env.NODE_ENV}.env`, 'local.env'],
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      cache: true,
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

    TranslatorModule.forRoot({
      global: true,
      defaultLang: 'en',
      translationSource: '/src/i18n',
    }),
    SharedModule,
    UserModule,
    AuthModule,
    PostModule,
    GatewayModule,
    MessageModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    {
      provide: APP_PIPE,
      useValue: validatorPipe,
    },
  ],
})
export class AppModule {}
