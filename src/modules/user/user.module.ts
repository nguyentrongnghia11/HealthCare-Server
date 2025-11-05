import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongoModule } from 'src/core/database/database.module';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.schema';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [MongoModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), OtpModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }




