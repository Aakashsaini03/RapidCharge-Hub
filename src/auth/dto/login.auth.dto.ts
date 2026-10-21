import{IsNotEmpty, IsString, IsEmail} from 'class-validator';

export class LoginAuthDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;


    @IsNotEmpty()
    @IsString()
    role: string;


    @IsNotEmpty()
    @IsString()
    password: string;
}