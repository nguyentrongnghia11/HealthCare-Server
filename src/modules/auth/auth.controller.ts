import { User } from './../user/entities/user.schema';
import { Controller, Get, Post, UseGuards, Request, Req, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { get } from 'mongoose';
import { LoginUserDto } from './dto/login-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { GoogleAuth } from 'google-auth-library';
import { GoogleAuthGuads } from './guards/google-auth.guard';



@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly userService: UserService
  ) {
    console.log("✅ AuthController initialized")
  }


  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    console.log('🎉 Login endpoint hit');
    console.log('👤 User from req:', req.user);
    return await this.authService.login(req.user);
  }


  @Get()
  logout() {

  }

  @Post('google')
  @UseGuards (GoogleAuthGuads)
  async googleAuth(@Req() req: Request) {
     return await this.authService.loginGoogle((req as any).payload)
  }

}
