import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from './BaseModel';
import { UserModel } from './UserModel';
import { PostModel } from './PostModel';

@Entity('feeds')
export class FeedModel extends BaseModel {
  @Index()
  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Index()
  @Column({ type: 'int', nullable: true })
  post_id: number;

  @Index()
  @Column({ type: 'int', nullable: true })
  posted_by: number;

  @ManyToOne(() => UserModel, (userModel) => userModel.feeds)
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  @ManyToOne(() => PostModel, (postModel) => postModel.feeds)
  @JoinColumn({ name: 'post_id' })
  post: PostModel;
}
