import { Module, forwardRef } from '@nestjs/common';

import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from '~/database/models/UserModel';
import { UserController } from './user.controller';
import { AddressModel } from '~/database/models/addressModel';
import { ProfileModel } from '~/database/models/ProfileModel';
import { FileModel } from '~/database/models/FileModel';
import { LikeCacheModel } from '~/database/models/LikeCacheModel';
import { MatchModel } from '~/database/models/MatchModel';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserModel,
      AddressModel,
      ProfileModel,
      FileModel,
      LikeCacheModel,
      MatchModel,
    ]),
    forwardRef(() => NotificationModule),
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
