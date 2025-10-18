import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

  create(createUserDto: CreateUserDto) {
    const { password, ...user } = createUserDto
    const hashpassword = password
    const userNew = this.userModel.create({ ...user, passwordHash: hashpassword });

    if (!userNew) {
      return
    }
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

  async findOneByName(name: string):Promise<User | null> {
    return await this.userModel.findOne({ name: name });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
