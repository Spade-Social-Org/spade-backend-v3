import { Injectable } from '@nestjs/common';
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
  ) {}
  async create(payload: createMessageDto): Promise<MessageModel> {
    console.log(payload);

    /**
     * send the message body {content,creator_id,receiver_id,group_id}
     * if(receiver_id) find the user to receive the message and find the conversation with the creator_id and the receiver_id
     * if(group_id) find the group to receive the message and find the conversation with the group_id
     * if no group or no receiver  throw an error
     *
     * if(!conversation) create a new conversation either for the creator_id and the receiver_id or for the group_id
     * create the message with the message payload  and  conversation_id
     *  throw new NotFoundAppException(ResponseMessage.USER_NOT_FOUND);
     * throw new BadRequestAppException(ResponseMessage.BAD_REQUEST);
     *
     *
     *
     */
    try {
      let conversation: ConversationModel | null;
      const senderExist = await this.userService.findOneById(payload.sender_id);
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

      return await this.messageRepository.save(newMessage);
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
}
