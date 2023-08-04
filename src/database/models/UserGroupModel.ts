import { Column, Entity, Index } from 'typeorm';
import { BaseModel } from './BaseModel';

@Entity('user_groups')
export class UserGroupModel extends BaseModel {
  @Index()
  @Column({ type: 'int' })
  user_Id: number;
  @Index()
  @Column({ type: 'int' })
  group_model_id: number;
}
