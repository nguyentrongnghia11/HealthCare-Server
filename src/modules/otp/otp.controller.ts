import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    console.log ("day la email ", createUserDto)
    const res = this.otpService.sendOtp(createUserDto.email)
    if (!res) {
      throw new InternalServerErrorException('Gửi OTP thất bại!');
    }
    return {
      message: "Send OTP success"
    };
  }
}
