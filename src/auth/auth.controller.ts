import { Controller, Get, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {

    @Get('login')
    login() {
        return 'Login endpoint';
    }
    
    @Post('register')
    register() {
        return 'Register endpoint';
    }

}



