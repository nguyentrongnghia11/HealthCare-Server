import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { get } from 'mongoose';
import { LoginUserDto } from './dto/login-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { 
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



}
