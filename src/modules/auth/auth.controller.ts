import { User } from './../user/entities/user.schema';
import { Controller, Get, Post, UseGuards, Request, Req, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { get } from 'mongoose';
import { LoginUserDto } from './dto/login-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';



@Controller('v1/auth')
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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    console.log("checked down")
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request) {
    const { user } = (req as any);
    console.log ("hahah")

    let existingUser = await this.userService.findOneByEmail(user.email);

    if (!existingUser) {
      console.log ("not exists")
      const userDto = {
        username: user.firstName,
        email: user.email,
        type: 'google',
        password: null,
      };

      try {
        existingUser = await this.userService.create(userDto);
        
      } catch (error) {
        console.error('Lỗi khi tạo tài khoản Google:', error);
        throw new InternalServerErrorException('Không thể tạo tài khoản Google mới.');
      }
    }
    else {
      
      console.log ("exists")
      await this.userService.addType(existingUser._id.toString(), "google")
    }
    return await this.authService.login(existingUser)

  }
}
