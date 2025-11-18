import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'super-secret-key',
    });
  }

  async validate(payload: any) {
    console.log('JWT payload validated:', payload);
    // Attach payload to req.user
    return payload;
  }
}


// export class 