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

@Entity('posts')
export class PostModel extends BaseModel {
  @Index()
  @Column({ type: 'varchar', nullable: true })
  description: string;

  @OneToMany(() => FileModel, (fileModel) => fileModel.post)
  files: FileModel[];
  @Index()
  @ManyToOne(() => UserModel, (userModel) => userModel.posts)
  @JoinColumn({ name: 'user_id' })
  user: UserModel;
}
