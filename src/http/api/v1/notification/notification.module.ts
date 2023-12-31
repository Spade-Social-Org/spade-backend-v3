import { Module, forwardRef } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';

import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationModel } from '~/database/models/NotificationModel';
import { messageNotificationModel } from '~/database/models/MessageNotificationModel';
import { LikeNotificationModel } from '~/database/models/LikeNotificationModel';
import { DatingNotificationModel } from '~/database/models/DatingNotification';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationModel,
      messageNotificationModel,
      LikeNotificationModel,
      DatingNotificationModel,
    ]),

    forwardRef(() => UserModule),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
