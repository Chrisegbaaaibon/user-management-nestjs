import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

type JwtPayload = {
      email: string;
      sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
      constructor( configService: ConfigService){
         super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_SECRET')
         })
      };

      async validate(payload: JwtPayload){
         return payload;
      }
}