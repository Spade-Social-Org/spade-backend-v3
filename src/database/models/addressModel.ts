import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import { UserModel } from './UserModel';

@Entity('addresses')
export class AddressModel extends BaseModel {
  @Column({ type: 'varchar', nullable: true })
  country: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  state: string;

  @Column({ type: 'int', nullable: true })
  postal_code: number;

  @Index()
  @ManyToOne(() => UserModel, (userModel) => userModel.files)
  @JoinColumn({ name: 'user_id' })
  user: UserModel;
}
