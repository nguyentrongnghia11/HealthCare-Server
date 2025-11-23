import { User } from './../user/entities/user.schema';
import { Controller, Get, Post, UseGuards, Request, Req, InternalServerErrorException, Headers, Body, UnauthorizedException, BadRequestException, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { get } from 'mongoose';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { GoogleAuth } from 'google-auth-library';
import { GoogleAuthGuads } from './guards/google-auth.guard';
import { FacebookAuthGuads } from './guards/facebook-auth.guard';



@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly userService: UserService
  ) {
    console.log("✅ AuthController initialized")
  }


  @Get('verify')
  async verify(@Headers('authorization') authorization: string) {
    if (!authorization) {
      return { valid: false, error: 'No authorization header' };
    }

    const token = authorization.replace('Bearer ', '');
    return await this.authService.verifyToken(token);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return await this.authService.refreshToken(refreshToken);
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
  @UseGuards(GoogleAuthGuads)
  async googleAuth(@Req() req: Request) {
    return await this.authService.loginGoogle((req as any).payload)
  }


  @Post('facebook') 
  @UseGuards(FacebookAuthGuads)
  async facebookAuth(@Req() req: Request) {
    console.log("req paylload ", (req as any).payload)
    return await this.authService.loginFacebook((req as any).payload)
  }

  /**
   * Change password for local account
   * Requires JWT authentication
   */
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    // Check if user has local account
    if (!user.type || !user.type.includes('local')) {
      throw new BadRequestException('This account does not support password change. Please use social login.');
    }

    await this.authService.changePassword(user._id.toString(), changePasswordDto);
    
    return {
      message: 'Password changed successfully'
    };
  }
}
