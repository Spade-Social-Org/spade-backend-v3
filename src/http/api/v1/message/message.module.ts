import { Module, forwardRef } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { FileModel } from '~/database/models/FileModel';
import { MatchModel } from '~/database/models/MatchModel';
import { UserModule } from '../user/user.module';
import { MessageModel } from '~/database/models/MessageModel';
import { GroupModel } from '~/database/models/GroupsModel';
import { ConversationModel } from '~/database/models/ConversationModel';
import { UserGroupModel } from '~/database/models/UserGroupModel';
import { MessageController } from './message.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FileModel,
      MatchModel,
      MessageModel,
      GroupModel,
      ConversationModel,
      UserGroupModel,
    ]),
    UserModule,
    forwardRef(() => NotificationModule),
  ],
  providers: [MessageService],
  exports: [MessageService],
  controllers: [MessageController],
})
export class MessageModule {}
