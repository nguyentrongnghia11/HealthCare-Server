import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { NutritionService } from '../nutrition/nutrition.service';
import { RunningService } from 'src/running/running.service';
import { CycleService } from '../cycle/cycle.service';
import { Types } from 'mongoose';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private nutritionService: NutritionService,
    private runningService: RunningService,
    private cycleService: CycleService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {

    console.log(createUserDto)

    const result = await this.userService.create(createUserDto);
    return {
      message: "Create user success",
      data: result
    }
  }

  /**
   * Get sleep schedule for authenticated user for a given date
   * Query param: date=YYYY-MM-DD
   */
  @Get('me/sleep')
  @UseGuards(JwtAuthGuard)
  async getMySleep(@Req() req: any, @Query('date') date?: string) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    if (!date) {
      // default to today
      const today = new Date();
      date = today.toISOString().slice(0, 10);
    }

    // This will auto-create a record for the date if not exists (using latest/defaults)
    const record = await this.userService.getOrCreateSleepForDate(user._id.toString(), date);
    return { data: record || null };
  }

  @Get('me/sleep/latest')
  @UseGuards(JwtAuthGuard)
  async getMyLatestSleep(@Req() req: any) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');
    const record = await this.userService.getLatestSleep(user._id.toString());
    return record ? record : null;
  }

  /**
   * Get daily sleep minutes series for authenticated user
   * Query params: endDate=YYYY-MM-DD (optional), days=number (optional, default 7)
   */
  @Get('me/sleep/series')
  @UseGuards(JwtAuthGuard)
  async getMySleepSeries(@Req() req: any, @Query('endDate') endDate?: string, @Query('days') days?: string) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const n = days ? parseInt(days, 10) : 7;
    const series = await this.userService.getDailySleepSeries(user._id.toString(), endDate, n);
    return { data: series };
  }

  /**
   * Save sleep schedule for authenticated user for a given date
   * Body: { date: 'YYYY-MM-DD', bedtime: 'HH:mm', wakeup: 'HH:mm' }
   */
  @Post('me/sleep')
  @UseGuards(JwtAuthGuard)
  async saveMySleep(@Req() req: any, @Body() body: any) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const { date, bedtime, wakeup } = body || {};
    if (!date) throw new BadRequestException('date is required');
    const result = await this.userService.upsertSleep(user._id.toString(), date, { bedtime, wakeup });
    return { data: result };
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  /**
   * Get current authenticated user's detail information
   */
  @Get('me/detail')
  @UseGuards(JwtAuthGuard)
  async getMyDetail(@Req() req: any) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    return {
      birthday: user.birthday || null,
      gender: user.gender,
      height: user.height || null,
      weight: user.weight || null,
      activityLevel: user.activityLevel || 'sedentary',
      target: user.target || null,
      targetWeight: user.targetWeight || null,
      targetTimeDays: user.targetTimeDays || null,
    };
  }

  // Update current authenticated user's detail using JWT
  @Patch('me/detail')
  @UseGuards(JwtAuthGuard)
  async updateMyDetail(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    console.log('PATCH /user/me/detail headers.authorization =>', req?.headers?.authorization);
    const {email} = req?.user;
    if (!email) {
      throw new BadRequestException('Cannot determine user from token');
    }

    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const {
      totalTDEE,
      dailyCaloriesGoal,
      bmr,
      macroGoals,
      suggestedActivityKcal
    } = (await this.nutritionService.calculateNutritionGoals(updateUserDto)) as any;

    const userDetailDto = new UpdateUserDetailDto();
    userDetailDto.activityLevel = updateUserDto.activityLevel;
    userDetailDto.birthday = updateUserDto.birthday;
    userDetailDto.height = updateUserDto.height;
    userDetailDto.target = updateUserDto.target;
    userDetailDto.weight = updateUserDto.weight;
    userDetailDto.caloGoal = dailyCaloriesGoal;
    userDetailDto.gender = updateUserDto.gender;
    userDetailDto.carbGoal = macroGoals.carb;
    userDetailDto.proteinGoal = macroGoals.protein;
    userDetailDto.fatGoal = macroGoals.fat;
    userDetailDto.suggestedActivityKcal = suggestedActivityKcal;
    userDetailDto.targetWeight = updateUserDto.targetWeight;
    userDetailDto.targetTimeDays = updateUserDto.targetTimeDays;

    console.log ("userDetailDto ", userDetailDto)

    return this.userService.updateDetail(user._id.toString(), userDetailDto);
  }

  /**
   * Calorie summary for the authenticated user for a given day.
   * Query param: `date=YYYY-MM-DD` (optional)
   */
  @Get('me/calories')
  @UseGuards(JwtAuthGuard)
  async getMyCalorieSummary(@Req() req: any, @Query('date') date?: string) {
    console.log("co chay vao")
    const {email} = req?.user

    console.log("userId ", email)
    if (!email) throw new BadRequestException('Cannot determine user from token');

    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const meals = await this.nutritionService.findMealsByDay(user?._id.toString(), date);
    const consumed = (meals || []).reduce((s, m: any) => s + (m.calories || 0), 0);

    const runs = await this.runningService.findRunsByDay(user?._id.toString(), date);
    const burnedFromRuns = (runs || []).reduce((s, r: any) => s + (r.calories || 0), 0);

    const suggestedActivity = user?.suggestedActivityKcal || 0;
    const totalBurned = burnedFromRuns + suggestedActivity;

    const netConsumed = consumed - totalBurned;
    const goal = user?.caloGoal || 0;
    const remaining = Math.round(goal - netConsumed);

    console.log ("tikitaka")

    return {
      user: {
        id: user?._id.toString(),
        bmr: user?.bmr || 0,
        goal,
        macroGoals: {
          protein: user?.proteinGoal || 0,
          fat: user?.fatGoal || 0,
          carb: user?.carbGoal || 0,
        },
        suggestedActivityKcal: suggestedActivity,
      },
      summary: {
        date: date || new Date().toISOString().slice(0, 10),
        consumed,
        burnedFromRuns,
        totalBurned,
        netConsumed,
        remaining,
      },
      meals,
      runs,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!id || id === 'undefined' || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (!id || id === 'undefined' || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/detail')
  async updateDetail(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (!id || id === 'undefined' || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }

    const user = await this.userService.findOneById(id);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const {
      totalTDEE,
      dailyCaloriesGoal,
      bmr,
      macroGoals,
    } = (await this.nutritionService.calculateNutritionGoals(updateUserDto)) as any;

    const userDetailDto = new UpdateUserDetailDto();
    userDetailDto.activityLevel = updateUserDto.activityLevel;
    userDetailDto.birthday = updateUserDto.birthday;
    userDetailDto.height = updateUserDto.height;
    userDetailDto.target = updateUserDto.target;
    userDetailDto.weight = updateUserDto.weight;
    userDetailDto.caloGoal = dailyCaloriesGoal;
    userDetailDto.gender = updateUserDto.gender;
    userDetailDto.carbGoal = macroGoals.carb; //: { protein, fat, carb, ratio }
    userDetailDto.proteinGoal = macroGoals.protein; //: { protein, fat, carb, ratio }
    userDetailDto.fatGoal = macroGoals.fat; //: { protein, fat, carb, ratio }

    return this.userService.updateDetail(id, userDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    if (!id || id === 'undefined' || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }
    return this.userService.remove(id);
  }


  /**
   * Get weekly health statistics for authenticated user
   * Aggregates last 7 days of steps, water, sleep, and calories burned from running
   */
  @Get('me/weekly-stats')
  @UseGuards(JwtAuthGuard)
  async getMyWeeklyStats(@Req() req: any, @Query('endDate') endDate?: string) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    // Get health tracking stats (steps, water, sleep)
    const stats = await this.userService.getWeeklyStats(user._id.toString(), endDate);

    // Calculate calories burned from running (last 7 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const runningStats = await this.runningService.aggregateStats(
      user._id.toString(),
      startStr,
      endStr,
      'day'
    );

    stats.caloriesBurned = runningStats.summary.totalCalories;

    return stats;
  }

  /**
   * Get comprehensive weekly summary
   * Returns: avg calories consumed, avg sleep hours, total steps, avg calories from meals, period prediction
   */
  @Get('me/weekly-summary')
  @UseGuards(JwtAuthGuard)
  async getMyWeeklySummary(@Req() req: any, @Query('endDate') endDate?: string) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const end = endDate ? new Date(endDate) : new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 6); // Last 7 days
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // 1. Get health tracking (steps, sleep)
    const healthStats = await this.userService.getWeeklyStats(user._id.toString(), endStr);

    // 2. Get nutrition stats (calories consumed)
    const nutritionStats = await this.nutritionService.aggregateStats(
      user._id.toString(),
      startStr,
      endStr,
      'day'
    );

    // 3. Get running stats (calories burned)
    const runningStats = await this.runningService.aggregateStats(
      user._id.toString(),
      startStr,
      endStr,
      'day'
    );

    // 4. Get period prediction (latest cycle log)
    const latestCycle = await this.cycleService.getLatestCycleLog(user._id.toString());
    let nextPeriodPrediction: string | null = null;
    
    if (latestCycle && latestCycle.startDate) {
      // Simple prediction: assume 28-day cycle
      const avgCycleLength = 28;
      const lastPeriodDate = new Date(latestCycle.startDate);
      const predictedDate = new Date(lastPeriodDate);
      predictedDate.setDate(lastPeriodDate.getDate() + avgCycleLength);
      
      nextPeriodPrediction = predictedDate.toISOString().split('T')[0];
    }

    // Calculate averages
    const avgCaloriesConsumed = Math.round(nutritionStats.summary.totalCalories / 7);
    const avgSleepHours = parseFloat((healthStats.sleepMinutes / 7 / 60).toFixed(1));
    const avgCaloriesBurned = Math.round(runningStats.summary.totalCalories / 7);

    return {
      weeklyCaloriesConsumed: avgCaloriesConsumed,
      weeklySleepHours: avgSleepHours,
      weeklySteps: healthStats.steps,
      weeklyAvgCaloriesFromMeals: avgCaloriesConsumed,
      weeklyCaloriesBurned: avgCaloriesBurned,
      nextPeriodPrediction,
    };
  }

  /**
   * Get today's health summary
   * Returns: sleep schedule, steps, cycle status, nutrition consumed today
   */
  @Get('me/today-summary')
  @UseGuards(JwtAuthGuard)
  async getMyTodaySummary(@Req() req: any, @Query('date') date?: string) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const today = date || new Date().toISOString().split('T')[0];

    // 1. Get sleep schedule for today
    const sleepSchedule = await this.userService.getSleepByDate(user._id.toString(), today);

    // 2. Get health tracking (steps) for today
    const healthTracking = await this.userService.getDailyHealth(user._id.toString(), today);

    // 3. Get nutrition consumed today
    const meals = await this.nutritionService.findMealsByDay(user._id.toString(), today);
    const totalCalories = (meals || []).reduce((sum, m: any) => sum + (m.calories || 0), 0);
    const totalProtein = (meals || []).reduce((sum, m: any) => sum + (m.protein || 0), 0);
    const totalCarbs = (meals || []).reduce((sum, m: any) => sum + (m.carbs || 0), 0);
    const totalFat = (meals || []).reduce((sum, m: any) => sum + (m.fat || 0), 0);

    // 4. Get latest cycle log
    const latestCycle = await this.cycleService.getLatestCycleLog(user._id.toString());
    let cycleInfo: { phase: string; dayInCycle: number; daysUntilNextPeriod: number } | null = null;
    
    if (latestCycle && latestCycle.startDate) {
      const todayDate = new Date(today);
      const lastPeriodDate = new Date(latestCycle.startDate);
      const daysSinceLastPeriod = Math.floor((todayDate.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Simple cycle calculation (assume 28-day cycle)
      const avgCycleLength = 28;
      const dayInCycle = (daysSinceLastPeriod % avgCycleLength) + 1;
      const daysUntilNext = avgCycleLength - daysSinceLastPeriod;
      
      // Determine phase based on day in cycle
      let phase = 'unknown';
      if (dayInCycle >= 1 && dayInCycle <= 5) {
        phase = 'menstruation';
      } else if (dayInCycle >= 6 && dayInCycle <= 13) {
        phase = 'follicular';
      } else if (dayInCycle >= 14 && dayInCycle <= 16) {
        phase = 'ovulation';
      } else {
        phase = 'luteal';
      }
      
      cycleInfo = {
        phase,
        dayInCycle,
        daysUntilNextPeriod: daysUntilNext > 0 ? daysUntilNext : avgCycleLength + daysUntilNext,
      };
    }

    return {
      date: today,
      sleep: sleepSchedule ? {
        bedtime: sleepSchedule.bedtime,
        wakeup: sleepSchedule.wakeup,
      } : null,
      steps: healthTracking?.steps || 0,
      waterMl: healthTracking?.waterMl || 0,
      sleepMinutes: healthTracking?.sleepMinutes || 0,
      nutrition: {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        mealsCount: meals.length,
      },
      cycle: cycleInfo,
    };
  }

}