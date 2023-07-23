import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from '~/database/models/UserModel';
import { UserController } from './user.controller';
import { AddressModel } from '~/database/models/addressModel';
import { ProfileModel } from '~/database/models/ProfileModel';
import { FileModel } from '~/database/models/FileModel';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserModel,
      AddressModel,
      ProfileModel,
      FileModel,
    ]),
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
