
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  ValidateIf,
  Matches,
} from 'class-validator';

import { UserRole } from 'src/core/constant/app.constant';
export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain uppercase, lowercase, number, and special character',
    },
  )
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  // Required only when role is USER
  @ValidateIf((dto: SignupDto) => dto.role === UserRole.DRIVER)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  Vehicle_number?: string;

  // Required only when role is USER
  @ValidateIf((dto: SignupDto) => dto.role === UserRole.DRIVER)
  @IsString()
  @IsNotEmpty()
  drivingLicenseNumber?: string;

  // Required only when role is STATION_OWNER
  @ValidateIf((dto: SignupDto) => dto.role === UserRole.STATION_OWNER)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  stationName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
export { UserRole };

