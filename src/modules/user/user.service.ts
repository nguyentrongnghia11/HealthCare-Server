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

    console.log ("day la create Dto ", createUserDto)

    const rs = await this.otpService.verifyOtp(createUserDto.otpCode, createUserDto.email)
    if (!rs) {
      throw new InternalServerErrorException("Verify otp code fail!")
    }

    console.log("Day la rs ", rs)

    const { password, ...user } = createUserDto
    const hashpassword = password
    const userNew = await this.userModel.create({ ...user, passwordHash: hashpassword });
    console.log("Day la user khoi tao ", userNew)

    if (!userNew) {
      throw new InternalServerErrorException('Create OTP failed');
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

  async findOneByName(name: string): Promise<User | null> {
    return await this.userModel.findOne({ name: name });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async addType (id:string,  newType:string) {
    return await this.userModel.findByIdAndUpdate(id, {$addToSet: {type: newType}}, { new: true })
  }
}
