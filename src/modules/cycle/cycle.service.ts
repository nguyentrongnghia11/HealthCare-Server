// src/modules/cycle/cycle.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CycleLog, CycleLogDocument } from './entities/cycle-log.schema';
import { SymptomEntry, SymptomEntryDocument } from './entities/symptom-entry.schema';
import { LogPeriodDto } from './dto/log-period.dto';
import { LogSymptomDto } from './dto/log-symptom.dto';
import { UpdateCycleSettingsDto } from './dto/update-cycle-settings.dto';

@Injectable()
export class CycleService {
  constructor(
    @InjectModel(CycleLog.name) private cycleLogModel: Model<CycleLogDocument>,
    @InjectModel(SymptomEntry.name) private symptomEntryModel: Model<SymptomEntryDocument>,
  ) {}

  /**
   * Lấy ngày bắt đầu kỳ kinh gần nhất.
   */
  async getLatestCycleLog(userId: string): Promise<CycleLogDocument | null> {
    // Tìm bản ghi gần nhất dựa trên startDate
    return this.cycleLogModel
      .findOne({ userId })
      .sort({ startDate: -1 })
      .exec();
  }

  /**
   * Ghi lại một kỳ kinh nguyệt mới.
   */
  async logNewPeriod(userId: string, logPeriodDto: LogPeriodDto): Promise<CycleLogDocument> {
    const newLog = new this.cycleLogModel({
      userId,
      startDate: new Date(logPeriodDto.startDate),
      endDate: logPeriodDto.endDate ? new Date(logPeriodDto.endDate) : null,
      // Logic tính toán periodLength/cycleLength sẽ nằm ở đây
      // ...
    });
    return newLog.save();
  }

  /**
   * Ghi lại triệu chứng/tâm trạng hàng ngày.
   */
  async logDailySymptom(userId: string, logSymptomDto: LogSymptomDto): Promise<SymptomEntryDocument> {
    const newEntry = new this.symptomEntryModel({
      userId,
      date: new Date(logSymptomDto.date),
      name: logSymptomDto.symptomName,
      intensity: logSymptomDto.intensity,
    });
    return newEntry.save();
  }

  /**
   * Lấy tất cả triệu chứng đã ghi cho một ngày cụ thể.
   */
  async getSymptomsForDay(userId: string, date: Date): Promise<SymptomEntryDocument[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.symptomEntryModel.find({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).exec();
  }
  
  // ⚠️ Lưu ý: Cần thêm logic Dự đoán Chu kỳ (Cycle Prediction Logic) ở đây
  // Đây là logic phức tạp nhất, sử dụng lịch sử từ cycleLogModel để tính toán.
}