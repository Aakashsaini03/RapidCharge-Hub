import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

import { User } from '../users/entities/users.entity';
import { LoginDto } from './dto/login.auth.dto';
import { UtilsService } from 'src/common/util/util.service';
import { UserStatus } from 'src/core/constant/app.constant';
import {
  ACCOUNT_LOCKED_MESSAGE,
  INCORRECT_EMAIL_OR_PASSWORD,
  INVALID_USER,
} from 'src/core/constant/response.constant';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly utilsService: UtilsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Allows +/- 1 time-step (~90-second total validity window)
    // authenticator.options = { window: 1 };
  }

  // -------------------------------------------------------------
  // 1. PRIMARY LOGIN (Email + Password)
  // -------------------------------------------------------------
  async login(logindto: LoginDto): Promise<any> {
    const { email, password } = logindto;
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new ForbiddenException(INVALID_USER);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException('Your account is suspended. Contact support.');
    }

    const passwordCorrect: boolean = await this.utilsService.matchPassword(
      user.password,
      password,
    );

    if (!passwordCorrect) {
      const fail = await this.utilsService.recordFailedAttempt(email, 'login');
      let msg = INCORRECT_EMAIL_OR_PASSWORD;
      if (fail.locked) {
        msg = ACCOUNT_LOCKED_MESSAGE(Math.ceil(fail.remaining / 60));
      }
      return {
        userId: user.GUID,
        resp: {
          statusCode: fail.locked ? HttpStatus.FORBIDDEN : HttpStatus.UNAUTHORIZED,
          message: msg,
          data: null,
          status: fail.locked ? HttpStatus.FORBIDDEN : HttpStatus.UNAUTHORIZED,
        },
      };
    } else {
      await this.utilsService.resetAttempts(email, 'login');
    }

    if (user.isMfaEnabled) {
      const mfaSecret = this.configService.get<string>('MFA_SECRET');
      const mfaSessionToken = this.jwtService.sign(
        {
          sub: user.id,
          guid: user.GUID,
          email: user.email,
          mfaPending: true,
        },
        {
          secret: mfaSecret,
          expiresIn: '5m',
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'MFA code required.',
        data: {
          mfaRequired: true,
          mfaSessionToken,
        },
      };
    }

    // Direct Login (MFA not active)
    return this.buildAuthResponse(user);
  }

  // -------------------------------------------------------------
  // 2. SETUP MFA (Step A: Generate Secret & QR Code)
  // -------------------------------------------------------------
  async generateMfaSecret(userId: number | string) {
    const isGuid = typeof userId === 'string' && userId.includes('-');
    const user = await this.userRepository.findOne({
      where: isGuid ? { GUID: userId as string } : { id: Number(userId) },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(user.email, 'RapidCharge Hub', secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    // Update using integer primary key user.id directly
    await this.userRepository.update(user.id, {
      mfaSecret: secret,
      isMfaEnabled: false,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'MFA setup initiated. Scan the QR code to enroll.',
      data: {
        secret,
        qrCodeDataUrl,
      },
    };
  }

  // -------------------------------------------------------------
  // 3. SETUP MFA (Step B: Confirm initial code and activate)
  // -------------------------------------------------------------
  async verifyAndEnableMfa(userId: number | string, code: string) {
    const isGuid = typeof userId === 'string' && userId.includes('-');
    const query = this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.mfaSecret');

    if (isGuid) {
      query.where('user.GUID = :guid', { guid: userId });
    } else {
      query.where('user.id = :id', { id: Number(userId) });
    }

    const user = await query.getOne();

    if (!user || !user.mfaSecret) {
      throw new BadRequestException('MFA enrollment has not been started.');
    }

    // Window: 1 allows 30 seconds clock drift
    const isValid = authenticator.verify({
      token: code?.trim(),
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid 6-digit verification code.');
    }

    await this.userRepository.update(user.id, { isMfaEnabled: true });

    return {
      statusCode: HttpStatus.OK,
      message: 'MFA enabled successfully.',
    };
  }

  
  // -------------------------------------------------------------
  // 4. VERIFY MFA LOGIN (Step 2 of 2FA Login Flow)
  // -------------------------------------------------------------
  async loginWithMfa(mfaSessionToken: string, code: string) {
    // Debug log to see what the server is receiving
    this.logger.debug(`Received mfaSessionToken type: ${typeof mfaSessionToken}`);
    this.logger.debug(`Received mfaSessionToken value: "${mfaSessionToken}"`);

    // 1. Sanitize incoming token string
    if (!mfaSessionToken || typeof mfaSessionToken !== 'string') {
      throw new UnauthorizedException('MFA session token is missing or malformed.');
    }

    // Strip "Bearer ", surrounding quotes, and whitespace/newlines
    const cleanedToken = mfaSessionToken
      .trim()
      .replace(/^Bearer\s+/i, '')
      .replace(/^["']|["']$/g, '')
      .trim();

    // Verify standard three-part JWT format: header.payload.signature
    const parts = cleanedToken.split('.');
    if (parts.length !== 3) {
      this.logger.error(
        `Invalid JWT format received. Expected 3 segments separated by dots, got ${parts.length}. Value: "${cleanedToken.slice(0, 30)}..."`,
      );
      throw new UnauthorizedException('MFA session token is not a valid JWT format.');
    }

    // 2. Secret matching login()
    const mfaSecret =
      this.configService.get<string>('MFA_SECRET');

    let payload: any;
    try {
      payload = this.jwtService.verify(cleanedToken, { secret: mfaSecret });
    } catch (err: any) {
      this.logger.error(`JWT Verification Failed: ${err?.name} - ${err?.message}`);
      throw new UnauthorizedException('MFA session expired or invalid. Please log in again.');
    }

    if (!payload.mfaPending) {
      throw new UnauthorizedException('Invalid MFA token.');
    }

    // Retrieve user and their stored secret
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.mfaSecret')
      .where('user.id = :id', { id: payload.sub })
      .getOne();

    if (!user || !user.mfaSecret || !user.isMfaEnabled) {
      throw new UnauthorizedException('User not found or MFA is not active.');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException('Your account is suspended.');
    }

    if (user.isBlacklisted) {
      throw new ForbiddenException('Your account is blacklisted.');
    }

    // Verify TOTP code with window allowance
    const isValid = authenticator.verify({
      token: code?.trim(),
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 6-digit MFA code.');
    }

    // Success -> Issue full access tokens
    return this.buildAuthResponse(user);
  }
  // -------------------------------------------------------------
  // 5. HELPER: Build Final Auth Response & Access Tokens
  // -------------------------------------------------------------
  private async buildAuthResponse(user: User) {
    const payload = {
      sub: user.id,
      guid: user.GUID,
      email: user.email,
      role: user.role,
    };

    const authSecret =
      this.configService.get<string>('AUTH_TOKEN_SECRET') ||
      'ekyn17rr3100939yqnic93dy3ibbxpd23w0wm0cmoxlsy39d26xusd68r0j0ku9r43fngtt1wmtuj';

    const accessToken = this.jwtService.sign(payload, {
      secret: authSecret,
      expiresIn: '1d',
    });

    user.updatedAt = new Date();
    await this.userRepository.save(user);

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful.',
      data: {
        mfaRequired: false,
        accessToken,
        user: {
          id: user.id,
          guid: user.GUID,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    };
  }
}