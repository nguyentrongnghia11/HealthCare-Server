import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateRunningDto } from './dto/create-running.dto';
import { UpdateRunningDto } from './dto/update-running.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Running, RunningDocument } from './entities/running.schema';

const CALORIES_PER_KG_KM = 0.75; 
const AVERAGE_SPEED_KMH = 5;  

@Injectable()
export class RunningService {
  private readonly logger = new Logger(RunningService.name);

  constructor(@InjectModel(Running.name) private runningModel: Model<RunningDocument>) { }

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
  calculateSuggestedActivity(kcalGoal: number, weight: number) {
    const suggestedDistanceKm = kcalGoal / (weight * CALORIES_PER_KG_KM);
    const suggestedTimeHours = suggestedDistanceKm / AVERAGE_SPEED_KMH;
    const suggestedTimeMinutes = suggestedTimeHours * 60; 
    const personalizedCalorieRate = weight * CALORIES_PER_KG_KM;

    return {
      suggestedActivity: {
        kcal: Math.round(kcalGoal),
        km: parseFloat(suggestedDistanceKm.toFixed(1)), // Làm tròn 1 chữ số thập phân
        timeMinutes: Math.round(suggestedTimeMinutes),
        caloriesPerKmRate: personalizedCalorieRate
      }
    };
  }

  /**
   * Aggregate running stats by day or week
   * @param userId User ID
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @param groupBy 'day' or 'week'
   */
  async aggregateStats(userId: string, startDate: string, endDate: string, groupBy: 'day' | 'week') {
    if (!userId) throw new BadRequestException('userId is required');
    if (!startDate || !endDate) throw new BadRequestException('startDate and endDate are required');
    if (groupBy !== 'day' && groupBy !== 'week') throw new BadRequestException('groupBy must be "day" or "week"');

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Include end date

    // Fetch all sessions in range
    const sessions = await this.runningModel.find({
      userId: userId.toString(),
      createdAt: { $gte: start, $lt: end }
    }).sort({ createdAt: 1 }).lean().exec() as any[];

    // Initialize stats map
    const statsMap = new Map<string, {
      date: string;
      distanceKm: number;
      calories: number;
      durationSec: number;
      sessions: number;
    }>();

    if (groupBy === 'day') {
      // Initialize all dates in range with zero values
      const current = new Date(start);
      while (current < end) {
        const dateKey = current.toISOString().split('T')[0];
        statsMap.set(dateKey, {
          date: dateKey,
          distanceKm: 0,
          calories: 0,
          durationSec: 0,
          sessions: 0
        });
        current.setDate(current.getDate() + 1);
      }

      // Aggregate sessions by day
      sessions.forEach((session: any) => {
        const dateKey = new Date(session.createdAt).toISOString().split('T')[0];
        const stat = statsMap.get(dateKey);
        if (stat) {
          stat.distanceKm += session.distanceKm || 0;
          stat.calories += session.calories || 0;
          stat.durationSec += session.durationSec || 0;
          stat.sessions += 1;
        }
      });
    } else {
      // Weekly grouping - group by Monday (ISO 8601 week start)
      const getMonday = (date: Date): string => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day; // Adjust to Monday
        d.setDate(d.getDate() + diff);
        return d.toISOString().split('T')[0];
      };

      // Initialize weeks in range
      const current = new Date(start);
      const seenWeeks = new Set<string>();
      while (current < end) {
        const monday = getMonday(current);
        if (!seenWeeks.has(monday)) {
          seenWeeks.add(monday);
          statsMap.set(monday, {
            date: monday,
            distanceKm: 0,
            calories: 0,
            durationSec: 0,
            sessions: 0
          });
        }
        current.setDate(current.getDate() + 1);
      }

      // Aggregate sessions by week
      sessions.forEach((session: any) => {
        const monday = getMonday(new Date(session.createdAt));
        const stat = statsMap.get(monday);
        if (stat) {
          stat.distanceKm += session.distanceKm || 0;
          stat.calories += session.calories || 0;
          stat.durationSec += session.durationSec || 0;
          stat.sessions += 1;
        }
      });
    }

    // Convert map to sorted array with chart-friendly format
    const stats = Array.from(statsMap.values()).map(stat => ({
      date: stat.date,
      distanceKm: parseFloat(stat.distanceKm.toFixed(1)),
      calories: Math.round(stat.calories),
      durationSec: Math.round(stat.durationSec),
      sessions: stat.sessions
    }));

    // Prepare data arrays for charts (labels and values separated)
    const chartData = {
      labels: stats.map(s => s.date),
      datasets: {
        distanceKm: stats.map(s => s.distanceKm),
        calories: stats.map(s => s.calories),
        durationSec: stats.map(s => s.durationSec),
        sessions: stats.map(s => s.sessions)
      }
    };

    // Calculate summary totals
    const summary = {
      totalDistanceKm: parseFloat(sessions.reduce((sum: number, s: any) => sum + (s.distanceKm || 0), 0).toFixed(1)),
      totalCalories: Math.round(sessions.reduce((sum: number, s: any) => sum + (s.calories || 0), 0)),
      totalDurationSec: Math.round(sessions.reduce((sum: number, s: any) => sum + (s.durationSec || 0), 0)),
      totalSessions: sessions.length
    };

    return { stats, chartData, summary };
  }
}
