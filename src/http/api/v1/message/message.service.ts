import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { MessageModel } from '~/database/models/MessageModel';
import { AppLogger } from '~/shared/AppLogger';
import { GroupModel } from '~/database/models/GroupsModel';
import { ConversationModel } from '~/database/models/ConversationModel';
import { createMessageDto } from './message.dto';
import { BaseAppException } from '~/http/exceptions/BaseAppException';
import { ServerAppException } from '~/http/exceptions/ServerAppException';
import { ResponseMessage } from '~/constant/ResponseMessageEnums';
import { NotFoundAppException } from '~/http/exceptions/NotFoundAppException';
import { MatchModel } from '~/database/models/MatchModel';
import { BadRequestAppException } from '~/http/exceptions/BadRequestAppException';
import { UserGroupModel } from '~/database/models/UserGroupModel';
import dataSource from '~/database/connections/default';
import { NotificationService } from '../notification/notification.service';
import { UserModel } from '~/database/models/UserModel';

@Injectable()
export class MessageService {
  constructor(
    private readonly appLogger: AppLogger,

    @InjectRepository(MessageModel)
    private messageRepository: Repository<MessageModel>,

    @InjectRepository(GroupModel)
    private groupRepository: Repository<GroupModel>,
    @InjectRepository(ConversationModel)
    private conversationRepository: Repository<ConversationModel>,
    @InjectRepository(MatchModel)
    private matchRepository: Repository<MatchModel>,
    @InjectRepository(UserGroupModel)
    private userGroupRespository: Repository<UserGroupModel>,
    private userService: UserService,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
  ) {}
  async create(payload: createMessageDto): Promise<MessageModel> {
    console.log(payload);

    try {
      let conversation: ConversationModel | null;
      const senderExist = await this.userService.findOneById(payload.sender_id);
      let receiver: UserModel;
      if (!senderExist) {
        throw new NotFoundAppException(ResponseMessage.USER_NOT_FOUND);
      }
      if (payload.receiver_id) {
        const user = this.userService.findOneById(payload.receiver_id);
        const userConversationWithSender = this.conversationRepository.findOne({
          where: [
            {
              creator_id: payload.sender_id,
              recipient_id: payload.receiver_id,
            },
            {
              creator_id: payload.receiver_id,
              recipient_id: payload.sender_id,
            },
          ],
        });
        const matches = this.matchRepository.findOne({
          where: [
            {
              user_id_1: payload.sender_id,
              user_id_2: payload.receiver_id,
            },
            {
              user_id_1: payload.receiver_id,
              user_id_2: payload.sender_id,
            },
          ],
        });
        const [_user, _conversation, _matches] = await Promise.all([
          user,
          userConversationWithSender,
          matches,
        ]);
        if (!_user)
          throw new NotFoundAppException(ResponseMessage.USER_NOT_FOUND);

        receiver = _user;

        if (!_matches)
          throw new BadRequestAppException(ResponseMessage.BAD_REQUEST);

        if (!_conversation) {
          conversation = await this.conversationRepository.save({
            recipient_id: payload.receiver_id,
            creator_id: payload.sender_id,
          });
        } else {
          conversation = _conversation;
        }
      } else {
        const group = this.groupRepository.findOne({
          where: { id: payload.group_id },
        });
        const groupConversation = this.conversationRepository.findOne({
          where: { group_id: payload.group_id },
        });
        const groupUser = this.userGroupRespository.findOne({
          where: {
            group_model_id: payload.group_id,
            user_Id: payload.sender_id,
          },
        });
        const [_group, _conversation, _groupUser] = await Promise.all([
          group,
          groupConversation,
          groupUser,
        ]);
        if (!_group)
          throw new NotFoundAppException(ResponseMessage.USER_NOT_FOUND);
        if (!_groupUser)
          throw new BadRequestAppException(ResponseMessage.BAD_REQUEST);
        if (!_conversation) {
          const newGroupConversation = new ConversationModel();
          newGroupConversation.groupModel = _group;
          conversation = await this.conversationRepository.save(
            newGroupConversation,
          );
        } else {
          conversation = _conversation;
        }
      }
      if (!conversation) {
        throw new ServerAppException(ResponseMessage.SERVER_ERROR);
      }
      const newMessage = new MessageModel();
      newMessage.conversation = conversation;
      newMessage.content = payload.content;
      newMessage.user = senderExist;
      newMessage.post_id = payload?.post_id as number;
      newMessage.parent_message_id = payload?.parent_message_id as number;

      const message = await this.messageRepository.save(newMessage);
      if (payload.receiver_id) {
        const pushNotificationPayload = {
          title: 'Message ',
          body: `${senderExist.name} sent you a message`,
          data: {},
          userId: payload.receiver_id,
        };
        await Promise.all([
          this.notificationService.saveMessageNotifications(
            payload.receiver_id,
            senderExist.id,
            message.id,
          ),
          // this.notificationService.sendPushNotifications(
          //   pushNotificationPayload,
          // ),
        ]);
      }

      return message;
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async getConversation(userId: number, userId1: number) {
    try {
      const query = `
      SELECT
      m."content",
      m.created_at,
      u."name",
      u.id AS user_id,
      userFiles.file_url AS image,
      ( select jsonb_build_object('id','pt.id','description','pt.description','gallery','files.file_path',
      'file_type','files.file_type'
       )from posts pt left join files files on files.post_id = pt.id  and files."entityType" = 'post'  where pt.id =m.post_id)as post,
       ( select jsonb_build_object('id','msg.id','content','msg.content'
        )from  messages msg  where msg.id =m.parent_message_id and msg.conversation_id=m.conversation_id)as parent_message,
      userFiles.file_path AS gallery
      
  FROM
      conversations c
  INNER JOIN
      messages m ON m.conversation_id = c.id
  INNER JOIN
      users u ON u.id = m.sender_id
  LEFT JOIN
      files userFiles ON userFiles.user_id = u.id AND userFiles."entityType" = 'user'
  WHERE
      (c.creator_id = $1 OR c.recipient_id = $1) 
      AND (c.creator_id = $2 OR c.recipient_id = $2)
  ORDER BY
      m.created_at DESC;
        `;
      return await dataSource.manager.query(query, [userId, userId1]);
    } catch (error) {
      console.error(error);
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async getConversations(userId: number) {
    try {
      const query = `
      SELECT
  
      (select m."content" from messages m where m."conversation_id"=c.id order by  m.created_at desc limit 1) as "latest_message",
      u."name",
      u.id AS user_id,
      userFiles.file_url AS image,
      userFiles.file_path AS gallery
  FROM
      conversations c
  
      INNER JOIN users AS u ON
      CASE
          WHEN c.creator_id = $1 THEN c.recipient_id = u.id
          ELSE c.creator_id = u.id
      END
  LEFT JOIN
      files userFiles ON userFiles.user_id = u.id AND userFiles."entityType" = 'user'
  WHERE
      c.creator_id = $1 OR c.recipient_id = $1
     
  ORDER BY
      c.created_at DESC;
        `;
      return await dataSource.manager.query(query, [userId]);
    } catch (error) {
      console.error(error);
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async findOne(id: number) {
    try {
      return await this.messageRepository.findOne({ where: { id } });
    } catch (error) {}
  }
}
