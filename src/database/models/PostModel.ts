import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseModel } from './BaseModel';
import { FileModel } from './FileModel';
import { UserModel } from './UserModel';
import { FeedModel } from './feedModel';
import { PostLikeModel } from './PostLikeModel';

@Entity('posts')
export class PostModel extends BaseModel {
  @Index()
  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Index()
  @Column({ type: 'boolean', nullable: true, default: false })
  is_story: boolean;

  @OneToMany(() => FileModel, (fileModel) => fileModel.post)
  files: FileModel[];
  @OneToMany(() => PostLikeModel, (likes) => likes.post)
  likes: PostLikeModel[];

  @OneToMany(() => FeedModel, (feedModel) => feedModel.post)
  feeds: FeedModel[];

  @Index()
  @ManyToOne(() => UserModel, (userModel) => userModel.posts)
  @JoinColumn({ name: 'user_id' })
  user: UserModel;
}
