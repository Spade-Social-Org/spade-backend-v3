import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';

export abstract class BaseModel {
  @PrimaryGeneratedColumn('increment')
  @PrimaryColumn('int')
  id: number;

  @Index()
  @CreateDateColumn()
  created_at: Date;

  @Index()
  @UpdateDateColumn()
  updated_at: Date;
}
