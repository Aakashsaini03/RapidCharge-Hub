import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { UserRole } from 'src/core/constant/app.constant';


export class CreateUserTypeDto {
  @IsNotEmpty()
  @IsEnum(UserRole, {
    message: 'code must be one of the following: DRIVER, OWNER, ADMIN',
  })
  @MaxLength(20)
  code: UserRole;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}