import { IsString,IsEmail, IsNotEmpty, IsNumber} from "class-validator";

export class RegisterAuthDto {
    @IsNotEmpty()
    @IsString()
    first_name: string;

    @IsNotEmpty()   
    @IsString()
    last_name: string;


    @IsNotEmpty()
    @IsString()
    role: string;

    @IsNumber()
    @IsNotEmpty()
    phone_number: number;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}