import { IsNotEmpty, IsString, Equals } from 'class-validator';

export class OtpVerificationDto {
  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsNotEmpty()
  @Equals('WEB', { message: 'otpPurpose must be WEB' })
  otpPurpose: 'WEB';
}

export class ResendOtpDto {
  @IsNotEmpty()
  @Equals('WEB', { message: 'otpPurpose must be WEB' })
  otpPurpose: 'WEB';
}