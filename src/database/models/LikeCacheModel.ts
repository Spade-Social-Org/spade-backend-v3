import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from './BaseModel';
import { UserModel } from './UserModel';

@Entity('like_caches')
export class LikeCacheModel extends BaseModel {
  @Column({ type: 'int', nullable: true })
  user_liker: number;

  @Column({ type: 'int', nullable: true })
  user_likee: number;
  @Index()
  @ManyToOne(() => UserModel, (userModel) => userModel.likers)
  @JoinColumn({ name: 'user_liker' })
  liker: UserModel;

  @Index()
  @ManyToOne(() => UserModel, (userModel) => userModel.likees)
  @JoinColumn({ name: 'user_likee' })
  likee: UserModel;
}
