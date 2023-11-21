import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from './BaseModel';
import { NotificationModel } from './NotificationModel';

@Entity('message_notifications')
export class messageNotificationModel extends BaseModel {
  @Index()
  @Column({ type: 'int' })
  sender_Id: number;
  @Index()
  @Column({ type: 'int' })
  notification_id: number;
  @Column({ type: 'int' })
  message_id: number;
  @Column({ type: 'varchar' })
  description: string;

  @ManyToOne(
    () => NotificationModel,
    (notificationModel) => notificationModel.messageNotifications,
  )
  @JoinColumn({ name: 'notification_id' })
  notification: NotificationModel;
}
