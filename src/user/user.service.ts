import {
  Injectable,
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UserDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens, JwtPayload } from 'src/types';
import { generateOTP, generateRandomBytes, setValueInRedis } from 'src/utils/otp.util';
import { resetPasswordDto, forgotPasswordDto, AuthDto, confirmOTP } from 'src/auth/dto/create-auth.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(userDto: UserDto): Promise<Tokens> {
      const password = userDto.password;
      const oldUser = await this.userModel.findOne({ email: userDto.email });
      if (oldUser) {
        throw new BadRequestException('User already exists');
      }
      const hashedPassword = await this.hashData(password);
      const user = new this.userModel({
         ...userDto,
         password: hashedPassword,
      })

      const savedUser = await user.save();
      const tokens = await this.getTokens(savedUser.id, savedUser.email);
      return tokens;
  };

   async signIn(userDto: UserDto): Promise<Tokens> {
      const user= await this.userModel.findOne({ email: userDto.email });
      if (!user) {
         throw new BadRequestException('Invalid credentials');
      }
      const isPasswordValid = await this.verifyPassword(
         user.password,
         userDto.password,
      );
      if (!isPasswordValid) {
         throw new BadRequestException('Invalid credentials');
      }

      const otp = generateOTP(6);
      await setValueInRedis(user.id, otp);
      // send email with OTP
      
      const tokens = await this.getTokens(user.id, user.email);
      return tokens;
   };

   async confirmOTP(dto: confirmOTP, userId: string): Promise<void> {
      const { OTP } = dto;
      const user = await this.userModel.findOne({ _id: userId });
      if (!user) {
         throw new BadRequestException('Invalid user');
      }
      const isOTPValid = await verify(userId, OTP);
      if (!isOTPValid) {
         throw new BadRequestException('Invalid OTP');
      }
      await this.userModel.updateOne({ _id: user.id }, { isVerified: true });
   };

   async forgotPassword(dto: forgotPasswordDto): Promise<void> {
      const { email } = dto;
      const user = await this.userModel.findOne({ email });
      if (!user) {
         throw new BadRequestException('User not found');
      }
      const OTP = generateRandomBytes()
      await setValueInRedis(email, OTP);
      // send email with OTP
   }

   async resetPassword(dto: resetPasswordDto, token: string): Promise<void> {
         const { password } = dto;
         const user = await this.userModel.findOne({ resetPasswordToken: token });
         if (!user) {
            throw new BadRequestException('Invalid token');
         }
         const hashedPassword = await this.hashData(password);
         await this.userModel.updateOne({ _id: user.id }, { password: hashedPassword });
   }

  hashData(data: string): Promise<string> {
    return hash(data);
  }

  verifyPassword(hashedData: string, plainData: string): Promise<boolean> {
      return verify(hashedData, plainData);
  }

  async getTokens(userId: string, email: string): Promise<Tokens> {
      const payload: JwtPayload = { 
            sub: userId,
            email: email,
       };

       const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                  secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                  expiresIn: '15m'                  
            }),
            this.jwtService.signAsync(payload, {
                  secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
                  expiresIn: '7d'
            })
       ]);

         return {
               accessToken,
               refreshToken,
         };
  }
}
