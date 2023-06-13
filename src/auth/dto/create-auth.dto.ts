import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}

export class forgotPasswordDto {
  @IsEmail()
  email: string;
}

export class resetPasswordDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class confirmOTP {
  @IsNotEmpty()
  OTP: string;
}