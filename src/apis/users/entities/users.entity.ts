import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
} from 'typeorm';

import { UserRole, UserStatus } from 'src/core/constant/app.constant';

@Entity({ name: 'users', schema: 'SEC' })
@Check(`"role" IN ('DRIVER', 'OWNER', 'ADMIN')`) // Enforces enum validation at the MSSQL engine level
export class User {
 @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ type: 'uniqueidentifier', name: 'GUID', unique: true })
  GUID: string;

  @Column({ type: 'nvarchar', length: 50 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'nvarchar', length: 255, unique: true })
  email: string;

  // Stored hashed password, omitted from standard queries
  @Column({ type: 'nvarchar', length: 255, select: false })
  password: string;

  // Replaced unsupported 'enum' with 'nvarchar'
  @Column({
    type: 'nvarchar',
    length: 50,
    default: UserRole.DRIVER,
  })
  role: UserRole;

   @Column({ type: 'varchar', length: 250, name: 'Vehicle_number', nullable: true })
  Vehicle_number: string;


  @Column({ type: 'varchar', length: 250, name: 'AadhaarImage', nullable: true })
  aadhaarImage: string;
@Column({
  type: 'nvarchar',
  length: 50,
  name: 'DrivingLicenseNumber',
  nullable: true,
})
drivingLicenseNumber: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  stationName?: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  phone?: string | null;

   @Column({
    name: 'IsBlacklisted',
    type: 'bit',
    default: () => '0',
  })
  isBlacklisted: boolean;

  @Column({
    name: 'status',
    type: 'nvarchar',
    length: 20,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'is_mfa_enabled', type: 'bit', default: 0 })
  isMfaEnabled: boolean;

  @Column({
    name: 'mfa_secret',
    type: 'nvarchar',
    length: 255,
    nullable: true,
    select: false, // Hidden from standard queries for security
  })
  mfaSecret: string | null;

  @Column({ name: 'google_id', type: 'nvarchar', length: 100, nullable: true })
  googleId: string | null;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date;
}