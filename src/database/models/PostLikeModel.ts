import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseModel } from './BaseModel';
import { UserModel } from './UserModel';
import { PostModel } from './PostModel';

@Entity('post_likes')
@Unique(['post_id', 'user_id'])
export class PostLikeModel extends BaseModel {
  @Column({ type: 'int', nullable: true })
  post_id: number;

  @Column({ type: 'boolean', nullable: true })
  unlike: boolean;

  @Column({ type: 'int', nullable: true })
  user_id: number;
  @Index()
  @ManyToOne(() => PostModel, (postModel) => postModel.likes)
  @JoinColumn({ name: 'post_id' })
  post: PostModel;

  @Index()
  @ManyToOne(() => UserModel, (userModel) => userModel.postLikes)
  @JoinColumn({ name: 'user_id' })
  user: UserModel;
}
