import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/apis/users/entities/users.entity';
import { UtilsModule } from 'src/common/util/util.module';
import { JwtModule } from '@nestjs/jwt'; // Do NOT import JwtService here
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('AUTH_TOKEN_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('AUTH_TOKEN_EXPIRY') || '1h') as any,
        },
      }),
    }),
    UtilsModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}