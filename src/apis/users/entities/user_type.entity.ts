// user-type.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserRole } from 'src/core/constant/app.constant';

@Entity({ name: 'user_types' })
export class UserType {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: false,
    comment: 'Used in JWT role claim: DRIVER, OWNER, ADMIN',
  })
  code: UserRole | string;

  @Column({
    type: 'nvarchar',
    length: 100,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'nvarchar',
    length: 255,
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'bit',
    nullable: false,
    default: () => "1", // Use true / 1 depending on database dialect (e.g. MSSQL bit)
  })
  is_active: boolean;

  @CreateDateColumn({ type: 'datetime2', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime2', name: 'updated_at' })
  updatedAt: Date;
}