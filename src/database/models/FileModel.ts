import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from './BaseModel';
import { UserModel } from './UserModel';
import { PostModel } from './PostModel';
import { FileEntityType, FileType } from '~/constant/ModelEnums';

@Entity('files')
export class FileModel extends BaseModel {
  @Index()
  @Column({ enum: FileEntityType, nullable: true })
  entityType: FileEntityType;

  @Column({ type: 'varchar', nullable: true })
  file_path: string[];

  @Column({ type: 'varchar', nullable: true })
  file_url: string;

  @Column({ enum: FileType, nullable: true })
  file_type: FileType;

  @Index()
  @ManyToOne(() => UserModel, (userModel) => userModel.files)
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  @Index()
  @ManyToOne(() => PostModel, (postModel) => postModel.files)
  @JoinColumn({ name: 'post_id' })
  post: PostModel;
}
