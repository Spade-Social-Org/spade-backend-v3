import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseModel } from './BaseModel';
import { FileModel } from './FileModel';
import { UserModel } from './UserModel';
import { FeedModel } from './feedModel';
import { PostLikeModel } from './PostLikeModel';
import { NotificationModelEnum } from '~/constant/ModelEnums';
import { messageNotificationModel } from './MessageNotificationModel';
import { LikeNotificationModel } from './LikeNotificationModel';

@Entity('notifications')
export class NotificationModel extends BaseModel {
  @Index()
  @Column({ enum: NotificationModelEnum, nullable: true })
  type: NotificationModelEnum;

  @Index()
  @Column({ type: 'boolean', nullable: true, default: false })
  is_read: boolean;
  @Index()
  @Column({ type: 'int' })
  user_id: number;

  @ManyToOne(() => UserModel, (userModel) => userModel.posts)
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  @OneToMany(
    () => messageNotificationModel,
    (messageNotification) => messageNotification.notification,
  )
  messageNotifications: messageNotificationModel[];
  @OneToMany(
    () => LikeNotificationModel,
    (likeNotification) => likeNotification.notification,
  )
  likeNotifications: LikeNotificationModel[];
}
