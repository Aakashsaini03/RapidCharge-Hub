import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignupDto } from './dto/Signup.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersservice: UsersService) {}

    
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() signupDto: SignupDto,
  ): Promise<{ message: string }> {
    const message = await this.usersservice.CreateUser(signupDto);

    return { message };
  }
}
