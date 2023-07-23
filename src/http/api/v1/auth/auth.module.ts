import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from '~/database/models/UserModel';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '~/constant/authConstants';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { SharedModule } from '~/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserModel]),
    UserModule,
    SharedModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
    }),
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
