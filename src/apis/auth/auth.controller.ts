import { Body, Controller, HttpCode, HttpStatus, Post, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private resolveUserId(
    req: Request & { user?: { id?: number }; user_id?: number | { id?: number } },
    requestUserId?: number,
  ): number {
    const maybeUserId =
      req?.user?.id ??
      (typeof req?.user_id === 'object' ? req.user_id?.id : req?.user_id) ??
      requestUserId;

    if (maybeUserId === undefined || maybeUserId === null || Number.isNaN(Number(maybeUserId))) {
      throw new UnauthorizedException('User not authenticated.');
    }

    return Number(maybeUserId);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('mfa/generate')
  async generateMfa(
    @Req() req: Request & { user?: { id?: number }; user_id?: number | { id?: number } },
    @Body('userId') requestUserId?: number,
  ) {
    const userId = this.resolveUserId(req, requestUserId);
    return this.authService.generateMfaSecret(userId);
  }

  @Post('mfa/enable')
  async enableMfa(
    @Req() req: Request & { user?: { id?: number }; user_id?: number | { id?: number } },
    @Body('code') code: string,
    @Body('userId') requestUserId?: number,
  ) {
    const userId = this.resolveUserId(req, requestUserId);
    return this.authService.verifyAndEnableMfa(userId, code);
  }

  @Post('mfa/verify-login')
  @HttpCode(HttpStatus.OK)
  async verifyMfaLogin(
    @Body('mfaSessionToken') mfaSessionToken: string,
    @Body('code') code: string,
  ) {
    return this.authService.loginWithMfa(mfaSessionToken, code);
  }
}


