import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateRunningDto } from './dto/create-running.dto';
import { UpdateRunningDto } from './dto/update-running.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Running, RunningDocument } from './entities/running.schema';

@Injectable()
export class RunningService {
  private readonly logger = new Logger(RunningService.name);

  constructor(@InjectModel(Running.name) private runningModel: Model<RunningDocument>) {}

  async create(createRunningDto: CreateRunningDto & { userId?: string }) {
    if (!createRunningDto || !createRunningDto.startTime) {
      throw new BadRequestException('Invalid running payload');
    }

    const doc = await this.runningModel.create(createRunningDto as any);
    return doc.toObject();
  }

  async findAll() {
    return this.runningModel.find().sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    return this.runningModel.findById(id).lean().exec();
  }

  async update(id: string, updateRunningDto: UpdateRunningDto) {
    await this.runningModel.updateOne({ _id: id }, { $set: updateRunningDto }).exec();
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.runningModel.deleteOne({ _id: id }).exec();
  }

  /** Find runs for a user between start (inclusive) and end (exclusive) */
  async findRunsByDay(userId: string, dateStr?: string) {
    if (!userId) throw new BadRequestException('userId is required');

    const date = dateStr ? new Date(dateStr) : new Date();
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    return this.runningModel.find({ userId: userId.toString(), createdAt: { $gte: start, $lt: end } }).sort({ startTime: 1 }).lean().exec();
  }
}
