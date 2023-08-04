import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseModel } from './BaseModel';
import { UserModel } from './UserModel';
import { MessageModel } from './MessageModel';
import { GroupModel } from './GroupsModel';

@Entity('conversations')
export class ConversationModel extends BaseModel {
  @Index()
  @Column({ type: 'int', nullable: true })
  group_id: number;

  @Column({ type: 'int', nullable: true })
  creator_id: number;

  @Column({ type: 'int', nullable: true })
  recipient_id: number;
  @OneToMany(() => MessageModel, (message) => message.conversation)
  messages: MessageModel[];
  @OneToOne(() => GroupModel, {
    eager: true,
  })
  @JoinColumn({ name: 'group_id' })
  groupModel: GroupModel;
}
