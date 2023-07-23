import { Column, Entity, Index } from 'typeorm';
import { BaseModel } from './BaseModel';
import {
  BodyTypeEnum,
  EthnicityEnum,
  GenderPreferenceEnum,
  RelationshipTypeEnum,
  ReligionEnum,
} from '~/constant/ModelEnums';

@Entity('profiles')
export class ProfileModel extends BaseModel {
  @Column({ type: 'varchar', nullable: true })
  gender: string;

  @Column({ enum: RelationshipTypeEnum, nullable: true })
  relationship_type: RelationshipTypeEnum;

  @Column({ type: 'int', nullable: true })
  min_age: number;

  @Column({ type: 'int', nullable: true })
  max_age: number;

  @Column({ type: 'varchar', nullable: true })
  hobbies: string[];

  @Index()
  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Column({ type: 'decimal', nullable: true })
  radius: number;

  @Column({ enum: GenderPreferenceEnum, nullable: true })
  gender_preference: GenderPreferenceEnum;

  @Column({ enum: ReligionEnum, nullable: true })
  religion: ReligionEnum;

  @Column({ enum: BodyTypeEnum, nullable: true })
  body_type: BodyTypeEnum;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ enum: EthnicityEnum, nullable: true })
  ethnicity: EthnicityEnum;

  @Index()
  @Column({ type: 'decimal', nullable: true })
  longitude: number;

  @Index()
  @Column({ type: 'decimal', nullable: true })
  latitude: number;

  @Column({ type: 'date', nullable: true })
  dob: Date;
}
