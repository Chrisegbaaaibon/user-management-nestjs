import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { JwtPayload, Tokens } from '../types';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  
}
