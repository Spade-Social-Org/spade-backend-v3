import { Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from './BaseModel';
import { UserModel } from './UserModel';

@Entity('matches')
export class MatchModel extends BaseModel {
  @Index()
  @ManyToOne(() => UserModel, (userModel) => userModel.users1)
  @JoinColumn({ name: 'user_id_1' })
  user1: UserModel;

  @Index()
  @ManyToOne(() => UserModel, (userModel) => userModel.users2)
  @JoinColumn({ name: 'user_id_2' })
  user2: UserModel;
}
