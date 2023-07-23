import { Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from './BaseModel';
import { UserModel } from './UserModel';

@Entity('like_caches')
export class LikeCacheModel extends BaseModel {
  @Index()
  @ManyToOne(() => UserModel, (userModel) => userModel.likers)
  @JoinColumn({ name: 'liker' })
  liker: UserModel;

  @Index()
  @ManyToOne(() => UserModel, (userModel) => userModel.likees)
  @JoinColumn({ name: 'likee' })
  likee: UserModel;
}
