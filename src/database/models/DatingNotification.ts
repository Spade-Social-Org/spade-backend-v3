import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from './BaseModel';
import { NotificationModel } from './NotificationModel';

@Entity('dating_notifications')
export class DatingNotificationModel extends BaseModel {
  @Index()
  @Column({ type: 'int' })
  user_date_id: number;
  @Index()
  @Column({ type: 'int' })
  notification_id: number;
  @Column({ type: 'varchar' })
  date_id: string;
  @Column({ type: 'varchar' })
  description: string;

  @ManyToOne(
    () => NotificationModel,
    (notificationModel) => notificationModel.messageNotifications,
  )
  @JoinColumn({ name: 'notification_id' })
  notification: NotificationModel;
}
