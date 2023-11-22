import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseModel } from './BaseModel';
import { FileModel } from './FileModel';
import { AddressModel } from './addressModel';
import { ProfileModel } from './ProfileModel';
import { PostModel } from './PostModel';
import { MatchModel } from './MatchModel';
import { LikeCacheModel } from './LikeCacheModel';
import { FeedModel } from './feedModel';
import { MessageModel } from './MessageModel';
import { GroupModel } from './GroupsModel';
import { PostLikeModel } from './PostLikeModel';

@Entity('users')
export class UserModel extends BaseModel {
  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;
  @Column({ type: 'varchar', nullable: true })
  username: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  phone_number: string;

  @Column({ type: 'varchar', nullable: true })
  otp: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  otp_verified: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => FileModel, (fileModel) => fileModel.user)
  files: FileModel[];

  @OneToMany(() => FeedModel, (feedModel) => feedModel.user)
  feeds: FeedModel[];

  @OneToMany(() => MessageModel, (message) => message.user)
  messages: MessageModel[];
  @OneToMany(() => AddressModel, (addressModel) => addressModel.user)
  addresses: AddressModel[];

  @OneToMany(() => PostModel, (postModel) => postModel.user)
  posts: PostModel[];

  @OneToMany(() => MatchModel, (matchModel) => matchModel.user1)
  users1: MatchModel[];

  @OneToMany(() => MatchModel, (matchModel) => matchModel.user2)
  users2: MatchModel[];

  @OneToMany(() => LikeCacheModel, (likeCacheModel) => likeCacheModel.liker)
  likers: LikeCacheModel[];

  @OneToMany(() => LikeCacheModel, (likeCacheModel) => likeCacheModel.likee)
  likees: LikeCacheModel[];

  @OneToOne(() => ProfileModel, {
    eager: true,
  })
  @JoinColumn({ name: 'profile_id' })
  profile: ProfileModel;

  @OneToMany(() => PostLikeModel, (likes) => likes.user)
  postLikes: PostLikeModel[];

  // @ManyToMany(() => GroupModel, (groupModels) => groupModels.users)
  // @JoinTable({
  //   name: 'user_groups',
  //   joinColumn: { name: 'user_Id' },
  //   inverseJoinColumn: { name: 'group_model_id' },
  // })
  // group_models: GroupModel[];
}
