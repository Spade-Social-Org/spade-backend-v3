import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from './BaseModel';
import { UserModel } from './UserModel';
import { ConversationModel } from './ConversationModel';

@Entity('messages')
export class MessageModel extends BaseModel {
  @Index()
  @Column({ type: 'int', nullable: true })
  sender_id: number;
  @Index()
  @Column({ type: 'int', nullable: true })
  conversation_id: number;

  @Column({ type: 'text', nullable: true })
  content: number;

  @ManyToOne(() => UserModel, (userModel) => userModel.messages)
  @JoinColumn({ name: 'sender_id' })
  user: UserModel;
  @ManyToOne(
    () => ConversationModel,
    (conversationModel) => conversationModel.messages,
  )
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationModel;
}
