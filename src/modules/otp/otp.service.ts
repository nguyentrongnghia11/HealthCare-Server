import { Body, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from './entities/otp.schema';
import { Error, Model } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { generateOTP } from 'src/utils/generateOTP.util';
import { CreateOTPDto } from './dto/create-otp.dto';


@Injectable()
export class OtpService {

    constructor(
        @InjectModel(Otp.name) private otpModel: Model<Otp>,
        private readonly mailService: MailService,
    ) { }


    async sendOtp(email: string) {

        const otpCode = generateOTP();
        const rs = await this.create({ email, otpCode } as CreateOTPDto)
        if (!rs) {
            throw new InternalServerErrorException('Create OTP failed');
        }
        await this.mailService.sendOTP(email, otpCode)
        return rs;
    }

    async verifyOtp(otpCode = "" as string, email: string) {
        const otpOrigin = await this.find(email)

        console.log("1 ", otpCode, ' 2 ', otpOrigin)

        if (otpCode === otpOrigin?.otpCode) {
            return otpOrigin;
        }
        return null;
    }


    create(createOTPDto: CreateOTPDto) {
        return this.otpModel.create(createOTPDto)
    }

    async find(email: string) {
        return await this.otpModel.findOne({ email: email }).sort({createdAt: -1})
    }


}
