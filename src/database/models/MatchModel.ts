import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from './BaseModel';
import { UserModel } from './UserModel';

@Entity('matches')
export class MatchModel extends BaseModel {
  @Index()
  @Column({ type: 'int', nullable: true })
  user_id_1: number;

  @Index()
  @Column({ type: 'int', nullable: true })
  user_id_2: number;

  @ManyToOne(() => UserModel, (userModel) => userModel.users1)
  @JoinColumn({ name: 'user_id_1' })
  user1: UserModel;

  @ManyToOne(() => UserModel, (userModel) => userModel.users2)
  @JoinColumn({ name: 'user_id_2' })
  user2: UserModel;
}
