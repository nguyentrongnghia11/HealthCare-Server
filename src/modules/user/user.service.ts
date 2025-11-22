import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.schema';
import { HealthTracking, HealthTrackingDocument } from './entities/health-tracking.schema';
import { SleepSchedule, SleepScheduleDocument } from './entities/sleep.schema';
import { Model } from 'mongoose';
import { OtpService } from '../otp/otp.service';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { Types } from 'mongoose';

import { EXERCISE_INTENSITY_FACTOR } from "src/modules/user/entities/user.schema";

const MIN_FEMALE_CALORIES = 1200; // Giới hạn an toàn cho Nữ
const DEFAULT_DEFICIT = 500;
const DEFAULT_SURPLUS = 300;

const MACRO_RATIO_LOST = { PROTEIN: 0.35, FAT: 0.25, CARB: 0.40 }; // Giảm cân: Protein cao
const MACRO_RATIO_GAIN = { PROTEIN: 0.30, FAT: 0.20, CARB: 0.50 }; // Tăng cân: Carb cao
const MACRO_RATIO_MAINTAIN = { PROTEIN: 0.25, FAT: 0.30, CARB: 0.45 }; // Giữ cân: Cân bằng

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(HealthTracking.name) private readonly healthTrackingModel: Model<HealthTrackingDocument>,
    @InjectModel(SleepSchedule.name) private readonly sleepModel: Model<SleepScheduleDocument>,
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
        if (createUserDto.otpCode) {
            const rs = await this.otpService.verifyOtp(createUserDto.otpCode, createUserDto.email);
            if (!rs) {
              throw new InternalServerErrorException("Verify otp code fail!");
            }
        }

        const { password, otpCode, ...user } = createUserDto;
        const hashpassword = password;

        const existingUser = await this.findOneByEmail(createUserDto.email);

        if (existingUser) {
          // User exists, update password and add 'local' to type array if not present
          if (hashpassword) {
            existingUser.passwordHash = hashpassword;
          }
          if (!existingUser.type.includes('local')) {
            await this.addType(existingUser._id.toString(), 'local');
          }
          userNew = await existingUser.save();
        } else {
          // Create new user
          userNew = await this.userModel.create({ 
            ...user, 
            passwordHash: hashpassword,
            type: ['local'],
            role: createUserDto.role || 'user'
          });
          
          if (!userNew) {
            throw new InternalServerErrorException('Create user failed');
          }
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

  // Keep compatibility wrapper: older callers that pass a numeric id will still work
  findOne(id: number) {
    return this.findOneById(String(id));
  }

  async findOneByEmail(email: string) {
    return this.userModel.findOne({ email: email });
  }


  findOneByFacebook(facebook_id: string) {
    return this.userModel.findOne({ facebook_id: facebook_id });
  }

  async findOneByName(username: string): Promise<User | null> {
    return await this.userModel.findOne({ username: username });
  }

  async findOneById(id: string): Promise<User | null> {
    return await this.userModel.findById(id);
  }

  // Update accepts ObjectId string and returns UpdateResult
  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }
    return await this.userModel.updateOne({ _id: id }, updateUserDto);
  }

  async updateDetail(id: string, updateUserDetailDto: UpdateUserDetailDto) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }
    return await this.userModel.updateOne({ _id: id }, updateUserDetailDto);
  }

  async remove(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }
    return await this.userModel.findByIdAndDelete(id);
  }

  async addType(id: string, newType: string) {
    return await this.userModel.findByIdAndUpdate(id, { $addToSet: { type: newType } }, { new: true })
  }

  /**
   * Get weekly health stats (last 7 days from today or specified endDate)
   * @param userId User ID
   * @param endDate Optional end date (YYYY-MM-DD), defaults to today
   */
  async getWeeklyStats(userId: string, endDate?: string) {
    if (!userId) throw new BadRequestException('userId is required');

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999); // End of day
    
    const start = new Date(end);
    start.setDate(start.getDate() - 6); // 7 days including today
    start.setHours(0, 0, 0, 0); // Start of day

    const records = await this.healthTrackingModel.find({
      userId: userId.toString(),
      date: { $gte: start, $lte: end }
    }).lean().exec() as any[];

    // Aggregate totals
    const stats = {
      steps: records.reduce((sum, r) => sum + (r.steps || 0), 0),
      caloriesBurned: 0, // Will be calculated from running service
      waterMl: records.reduce((sum, r) => sum + (r.waterMl || 0), 0),
      sleepMinutes: records.reduce((sum, r) => sum + (r.sleepMinutes || 0), 0),
    };

    return stats;
  }

  /**
   * Update or create daily health tracking record
   * @param userId User ID
   * @param date Date (YYYY-MM-DD)
   * @param data Health data to update (supports steps, waterMl, sleepMinutes, bedtime, wakeup)
   */
  async updateDailyHealth(userId: string, date: string, data: { steps?: number; waterMl?: number; sleepMinutes?: number; bedtime?: string; wakeup?: string }) {
    if (!userId) throw new BadRequestException('userId is required');
    if (!date) throw new BadRequestException('date is required');

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    const update: any = { ...data, userId: userId.toString(), date: dateObj };
    // Only set fields that are defined (avoid overwriting with undefined)
    const setObj: any = {};
    if (typeof data.steps !== 'undefined') setObj.steps = data.steps;
    if (typeof data.waterMl !== 'undefined') setObj.waterMl = data.waterMl;
    if (typeof data.sleepMinutes !== 'undefined') setObj.sleepMinutes = data.sleepMinutes;
    if (typeof data.bedtime !== 'undefined') setObj.bedtime = data.bedtime;
    if (typeof data.wakeup !== 'undefined') setObj.wakeup = data.wakeup;

    return await this.healthTrackingModel.findOneAndUpdate(
      { userId: userId.toString(), date: dateObj },
      { $set: { ...setObj, userId: userId.toString(), date: dateObj } },
      { upsert: true, new: true }
    ).lean().exec();
  }

  /**
   * Get daily health tracking record for a user and date
   */
  async getDailyHealth(userId: string, date: string) {
    if (!userId) throw new BadRequestException('userId is required');
    if (!date) throw new BadRequestException('date is required');
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    return await this.healthTrackingModel.findOne({ userId: userId.toString(), date: dateObj }).lean().exec();
  }

  /**
   * Get latest health tracking record for user
   */
  async getLatestDailyHealth(userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return await this.healthTrackingModel.findOne({ userId: userId.toString() }).sort({ date: -1 }).lean().exec();
  }

  // ------------------ SleepSchedule helpers ------------------
  async getSleepByDate(userId: string, date: string) {
    if (!userId) throw new BadRequestException('userId is required');
    if (!date) throw new BadRequestException('date is required');
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    return await this.sleepModel.findOne({ userId: userId.toString(), date: dateObj }).lean().exec();
  }

  async getLatestSleep(userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return await this.sleepModel.findOne({ userId: userId.toString() }).sort({ date: -1 }).lean().exec();
  }

  async upsertSleep(userId: string, date: string, data: { bedtime?: string; wakeup?: string }) {
    if (!userId) throw new BadRequestException('userId is required');
    if (!date) throw new BadRequestException('date is required');
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    const setObj: any = {};
    if (typeof data.bedtime !== 'undefined') setObj.bedtime = data.bedtime;
    if (typeof data.wakeup !== 'undefined') setObj.wakeup = data.wakeup;

    return await this.sleepModel.findOneAndUpdate(
      { userId: userId.toString(), date: dateObj },
      { $set: { ...setObj, userId: userId.toString(), date: dateObj } },
      { upsert: true, new: true }
    ).lean().exec();
  }

  /**
   * Get sleep schedule for date. If not exists, auto-create using latest saved schedule (or defaults).
   */
  async getOrCreateSleepForDate(userId: string, date: string) {
    if (!userId) throw new BadRequestException('userId is required');
    if (!date) throw new BadRequestException('date is required');
    const existing = await this.getSleepByDate(userId, date);
    if (existing) return existing;

    // Try latest
    const latest = await this.getLatestSleep(userId).catch(() => null);
    const defaults = { bedtime: '22:00', wakeup: '07:30' };
    const createObj = {
      bedtime: latest?.bedtime ?? defaults.bedtime,
      wakeup: latest?.wakeup ?? defaults.wakeup,
    };

    return await this.upsertSleep(userId, date, createObj);
  }

  /**
   * Return daily sleepMinutes series for a range ending at endDate for `days` days.
   * Uses `healthTrackingModel` which stores `sleepMinutes` per day.
   * Returns array of objects: { date: 'YYYY-MM-DD', sleepMinutes: number }
   */
  async getDailySleepSeries(userId: string, endDate?: string, days = 7) {
    if (!userId) throw new BadRequestException('userId is required');
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const records = await this.healthTrackingModel.find({
      userId: userId.toString(),
      date: { $gte: start, $lte: end }
    }).lean().exec() as any[];

    // create map dateStr -> sleepMinutes
    const map: Record<string, number> = {};
    records.forEach(r => {
      const d = new Date(r.date);
      const key = d.toISOString().slice(0,10);
      map[key] = (r.sleepMinutes || 0);
    });

    const result: Array<{ date: string; sleepMinutes: number }> = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0,10);
      result.push({ date: key, sleepMinutes: map[key] ?? 0 });
    }

    return result;
  }

}