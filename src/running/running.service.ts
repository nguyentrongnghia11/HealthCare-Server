import { Injectable } from '@nestjs/common';
import { CreateRunningDto } from './dto/create-running.dto';
import { UpdateRunningDto } from './dto/update-running.dto';

@Injectable()
export class RunningService {
  create(createRunningDto: CreateRunningDto) {
    return 'This action adds a new running';
  }

  findAll() {
    return `This action returns all running`;
  }

  findOne(id: number) {
    return `This action returns a #${id} running`;
  }

  update(id: number, updateRunningDto: UpdateRunningDto) {
    return `This action updates a #${id} running`;
  }

  remove(id: number) {
    return `This action removes a #${id} running`;
  }
}
