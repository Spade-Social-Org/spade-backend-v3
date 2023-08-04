import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { BaseModel } from './BaseModel';
import { UserModel } from './UserModel';
import { ConversationModel } from './ConversationModel';

@Entity('group_models')
export class GroupModel extends BaseModel {
  @Index()
  @Column({ type: 'varchar', nullable: true })
  name: string;

  // @ManyToMany(() => UserModel, (user) => user.group_models)
  // users: UserModel[];
}
