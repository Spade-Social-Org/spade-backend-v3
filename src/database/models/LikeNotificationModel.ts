import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from './BaseModel';
import { NotificationModel } from './NotificationModel';

@Entity('like_notifications')
export class LikeNotificationModel extends BaseModel {
  @Index()
  @Column({ type: 'int' })
  liker_Id: number;
  @Index()
  @Column({ type: 'int' })
  notification_id: number;

  @Column({ type: 'varchar' })
  description: string;

  @ManyToOne(
    () => NotificationModel,
    (notificationModel) => notificationModel.likeNotifications,
  )
  @JoinColumn({ name: 'notification_id' })
  notification: NotificationModel;
}
