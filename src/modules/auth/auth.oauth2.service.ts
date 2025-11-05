import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptionsWithRequest } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const options: StrategyOptionsWithRequest = {
      clientID: configService.get<string>('CLIENT_ID')!,
      clientSecret: configService.get<string>('CLIENT_SECRET')!,
      callbackURL: 'http://localhost:3000/v1/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true, 
    };
    super(options);
  }

  async validate(req: Request, accessToken: string, refreshToken: string, profile: any, done: Function) {
    const { name, emails, photos } = profile;
    
    const user = {
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0]?.value,
      accessToken,
    };
    done(null, user);
  }
}


// work flow: dang nhap -> url callback?code = ?? -> lấy thông tin -? validation -> trả về data
