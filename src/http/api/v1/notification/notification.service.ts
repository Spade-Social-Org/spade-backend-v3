import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { MessageModel } from '~/database/models/MessageModel';
import { AppLogger } from '~/shared/AppLogger';
import { GroupModel } from '~/database/models/GroupsModel';
import { ConversationModel } from '~/database/models/ConversationModel';

import { BaseAppException } from '~/http/exceptions/BaseAppException';
import { ServerAppException } from '~/http/exceptions/ServerAppException';
import { ResponseMessage } from '~/constant/ResponseMessageEnums';
import { NotFoundAppException } from '~/http/exceptions/NotFoundAppException';
import { MatchModel } from '~/database/models/MatchModel';
import { BadRequestAppException } from '~/http/exceptions/BadRequestAppException';
import { UserGroupModel } from '~/database/models/UserGroupModel';
import dataSource from '~/database/connections/default';
import { NotificationModel } from '~/database/models/NotificationModel';
import { NotificationModelEnum } from '~/constant/ModelEnums';
import { messageNotificationModel } from '~/database/models/MessageNotificationModel';
import { LikeNotificationModel } from '~/database/models/LikeNotificationModel';
import admin, { ServiceAccount } from 'firebase-admin';
import fcm from 'fcm-notification';
import credentials from './firebase.json';
import { DatingNotificationModel } from '~/database/models/DatingNotification';
const certPath = admin.credential.cert(credentials as ServiceAccount);
const FCM = new fcm(certPath);

@Injectable()
export class NotificationService {
  constructor(
    private readonly appLogger: AppLogger,

    @InjectRepository(messageNotificationModel)
    private messageNotificationRepository: Repository<messageNotificationModel>,

    @InjectRepository(NotificationModel)
    private notificationRepository: Repository<NotificationModel>,
    @InjectRepository(LikeNotificationModel)
    private LikeNotificationRepository: Repository<LikeNotificationModel>,
    @InjectRepository(DatingNotificationModel)
    private dateNotificationRepository: Repository<DatingNotificationModel>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}
  async getNotifications(userId: number): Promise<NotificationModel[]> {
    try {
      const user = await this.userService.findOneById(userId);
      if (!user) throw new NotFoundAppException(ResponseMessage.NOT_FOUND);
      // return await this.notificationRepository.find({
      //   where: { user_id: userId },
      //   relations: {
      //     messageNotifications: true,
      //     likeNotifications: true,
      //   },
      // });
      const query = `SELECT
     n.*,
     (
       SELECT
         jsonb_agg(
           jsonb_build_object(
             'id', mn.id,
             'created_at', mn.created_at,
             'sender_id', mn."sender_Id",
             'updated_at', mn.updated_at,
             'notification_id', mn.notification_id,
             'message_id', mn.message_id,
             'description', mn.description,
             'sender_image_url',f.file_url,
             'send_image_gallery',f.file_path
             
             
           )
         )
       FROM
         message_notifications mn
         inner join users u  on u.id = mn."sender_Id"
         left join files f on f.user_id = u.id and f."entityType" ='user' and f.file_type = 'image'
       WHERE
         mn.notification_id = n.id
     ) AS messageNotifications,
     (
       SELECT
         jsonb_agg(
           jsonb_build_object(
             'id', ln2.id,
             'created_at', ln2.created_at,
             'liker_id', ln2."liker_Id",
             'updated_at', ln2.updated_at,
             'notification_id', ln2.notification_id,
             'description', ln2.description,
             'sender_image_url',f.file_url,
             'send_image_gallery',f.file_path
             
             
           )
         )
       FROM
         like_notifications ln2  
         inner join users u  on u.id = ln2."liker_Id"
         left join files f on f.user_id = u.id and f."entityType" ='user' and f.file_type = 'image'
       WHERE
         ln2.notification_id = n.id
     ) AS likeNotifications,
     (
      SELECT
        jsonb_agg(
          jsonb_build_object(
            'id', dn2.id,
            'created_at', dn2.created_at,
            'user_date_id', dn2."user_date_id",
            'updated_at', dn2.updated_at,
            'notification_id', dn2.notification_id,
            'description', dn2.description,
            'sender_image_url',f.file_url,
            'send_image_gallery',f.file_path
            
            
          )
        )
      FROM
      dating_notifications dn2  
        inner join users u  on u.id = dn2."user_date_id"
        left join files f on f.user_id = u.id and f."entityType" ='user' and f.file_type = 'image'
      WHERE
      dn2.notification_id = n.id
    ) AS dateNotifications
   FROM
     notifications n
   WHERE
     n.user_id = $1;
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
  //updateNotification
  async updateNotification(userId: number, id: number): Promise<void> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: {
          user_id: userId,
          id,
        },
      });
      if (!notification)
        throw new NotFoundAppException(ResponseMessage.NOT_FOUND);
      notification.is_read = true;
      this.notificationRepository.save(notification);
    } catch (error) {
      console.error(error);
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async saveNotifications(
    userId: number,
    type: NotificationModelEnum,
  ): Promise<NotificationModel> {
    try {
      const user = await this.userService.findOneById(userId);
      if (!user) throw new NotFoundAppException(ResponseMessage.NOT_FOUND);
      return await this.notificationRepository.save({
        user_id: user.id,
        type,
      });
    } catch (error) {
      console.error(error);
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async saveMessageNotifications(
    userId: number,
    senderId: number,
    messageId: number,
  ): Promise<void> {
    try {
      const [user, sender] = await Promise.all([
        this.userService.findOneById(userId),
        this.userService.findOneById(senderId),
      ]);
      if (!user) throw new NotFoundAppException(ResponseMessage.NOT_FOUND);
      const notification = await this.saveNotifications(
        user.id,
        NotificationModelEnum.MESSAGE,
      );
      await this.messageNotificationRepository.save({
        notification_id: notification.id,
        description: `${sender?.name} sent you a message`,
        sender_Id: senderId,
        message_id: messageId,
      });
    } catch (error) {
      console.error(error);
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async saveDateNotifications(
    userId: number,
    userDateId: number,
    dateId: number,
    description: string,
  ): Promise<void> {
    try {
      const [user, userDate] = await Promise.all([
        this.userService.findOneById(userId),
        this.userService.findOneById(userDateId),
      ]);
      if (!user) throw new NotFoundAppException(ResponseMessage.NOT_FOUND);
      const notification = await this.saveNotifications(
        user.id,
        NotificationModelEnum.DATE,
      );
      await this.dateNotificationRepository.save({
        notification_id: notification.id,
        description,
        user_date_id: userDateId,
        date_id: dateId,
      });
    } catch (error) {
      console.error(error);
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }

  async saveLikeNotifications(userId: number, likerId: number): Promise<void> {
    try {
      const [user, liker] = await Promise.all([
        this.userService.findOneById(userId),
        this.userService.findOneById(likerId),
      ]);

      if (!user) throw new NotFoundAppException(ResponseMessage.NOT_FOUND);
      const notification = await this.saveNotifications(
        user.id,
        NotificationModelEnum.LIKE,
      );
      await this.LikeNotificationRepository.save({
        notification_id: notification.id,
        description: `new like from ${liker?.name} `,
        liker_Id: likerId,
      });
    } catch (error) {
      console.error(error);
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async sendPushNotifications(notificationData: {
    title: string;
    body: string;
    data: any;
    userId: number;
  }): Promise<void> {
    const { title, body, data, userId } = notificationData;
    try {
      const user = await this.userService.findOneById(userId);
      if (!user) throw new NotFoundAppException(ResponseMessage.NOT_FOUND);
      const message = {
        notification: {
          title,
          body,
        },
        data,
        token: user.profile.fcm_token,
      };
      await FCM.send(message);
    } catch (error) {
      console.error(error);
      this.appLogger.logError(error);
    }
  }
}
