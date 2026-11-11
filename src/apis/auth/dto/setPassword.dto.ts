import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SetPasswordDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  @Type(() => Number)
  isSetPassword: number;
}
