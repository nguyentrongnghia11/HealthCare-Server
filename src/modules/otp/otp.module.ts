import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MailModule } from '../mail/mail.module';
import { MongoModule } from 'src/core/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './entities/otp.schema';

@Module({
  imports: [MailModule, MongoModule, MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }])],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService]

})
export class OtpModule { }
