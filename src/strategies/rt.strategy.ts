import   {PassportStrategy} from '@nestjs/passport';
import {Strategy, ExtractJwt} from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, JwtPayloadWithRt } from '../types';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
   constructor( configService: ConfigService){
         super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_SECRET_RT'),
            passReqToCallback: true
         });
   }

   validate(req: Request, payload: JwtPayload): JwtPayloadWithRt{
      const refreshToken = req
      ?.get('Authorization')
      ?.replace('Bearer ', '')
      .trim()

      if(!refreshToken) throw new UnauthorizedException('Refresh token malformed');
      return {...payload, refreshToken};
   }
}