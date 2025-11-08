// auth/google.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UserDocument } from '../user/entities/user.schema';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Controller('auth')
export class GoogleController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) { }

  @Post('google')
  async googleLogin(@Body('idToken') idToken: string) {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload: any = ticket.getPayload();
    let user: UserDocument | null = await this.userService.findOneByEmail(payload.email);

    if (!user) {
      user = await this.userService.create({
        email: payload.email,
        username: payload.name,
        type: "google"
      });
    }

    const token = this.authService.login({ sub: user.id });
    return { token, user };
  }
}
