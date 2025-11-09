import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.schema';
import { Model } from 'mongoose';
import { OtpService } from '../otp/otp.service';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private otpService: OtpService
  ) { }

  async create(createUserDto: CreateUserDto) {
    console.log("day la create Dto ", createUserDto)
    let userNew: UserDocument | null = null;

    switch (createUserDto.type) {
      case "google": {
        userNew = await this.userModel.create(createUserDto);
        if (!userNew) {
          throw new InternalServerErrorException("Login google fail userservice!")
        }
        break;
      }

      case "local": {
        const rs = await this.otpService.verifyOtp(createUserDto.otpCode, createUserDto.email)
        if (!rs) {
          throw new InternalServerErrorException("Verify otp code fail!")
        }
        const { password, ...user } = createUserDto
        const hashpassword = password
        userNew = await this.userModel.create({ ...user, passwordHash: hashpassword });
        console.log("Day la user khoi tao ", userNew)

        if (!userNew) {
          throw new InternalServerErrorException('Create OTP failed');
        }

        break;

      }

      case "facebook": {
        userNew = await this.userModel.create(createUserDto);
        if (!userNew) {
          throw new InternalServerErrorException("Login facebook fail userservice!")
        }
        break;
      }
    }
    if (!userNew) {
      throw new InternalServerErrorException('Create user failed');
    }
    return userNew;

  }

  findAll() {
    return this.userModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }
  findOneByEmail(email: string) {
    return this.userModel.findOne({ email: email });
  }


  findOneByFacebook(facebook_id: string) {
    return this.userModel.findOne({ facebook_id: facebook_id });
  }

  async findOneByName(name: string): Promise<User | null> {
    return await this.userModel.findOne({ name: name });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne({ _id: updateUserDto.id }, updateUserDto);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async addType(id: string, newType: string) {
    return await this.userModel.findByIdAndUpdate(id, { $addToSet: { type: newType } }, { new: true })
  }
}
