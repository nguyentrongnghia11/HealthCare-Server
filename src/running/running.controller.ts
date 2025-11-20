import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { RunningService } from './running.service';
import { CreateRunningDto } from './dto/create-running.dto';
import { UpdateRunningDto } from './dto/update-running.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UserService } from 'src/modules/user/user.service';

@Controller('running')
export class RunningController {
  constructor(
    private readonly runningService: RunningService,
    private readonly userService: UserService,
  ) {}

  /**
   * Create a running session from frontend (uses frontend field names)
   */
  @Post('me/sessions')
  @UseGuards(JwtAuthGuard)
  async createSession(@Req() req: any, @Body() body: CreateRunningDto) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    // Convert frontend format to backend schema
    const runningData = {
      userId: user._id.toString(),
      distanceKm: body.distanceKm,
      durationSec: body.timeSeconds || body.durationSec || 0,
      calories: body.caloriesBurned || body.calories || 0,
      startTime: body.date || body.startTime || new Date().toISOString(),
      route: body.route || [],
    };

    return this.runningService.create(runningData);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() createRunningDto: CreateRunningDto) {
    const userId = req?.user?.sub || req?.user?._id || req?.user?.id || req?.user?.userId;
    return this.runningService.create({ ...createRunningDto, userId: userId?.toString() });
  }

  @Get()
  findAll() {
    return this.runningService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.runningService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRunningDto: UpdateRunningDto) {
    return this.runningService.update(id, updateRunningDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.runningService.remove(id);
  }

  /**
   * Get complete running data for today: sessions, summary stats, and target goals
   */
  @Get('me/today')
  @UseGuards(JwtAuthGuard)
  async getMyTodayData(@Req() req: any, @Query('date') date?: string) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const userId = user._id.toString();

    // Get all sessions for the day
    const sessions = await this.runningService.findRunsByDay(userId, date);

    // Calculate summary
    const totalDistanceKm = sessions.reduce((sum, s: any) => sum + (s.distanceKm || 0), 0);
    const totalCaloriesBurned = sessions.reduce((sum, s: any) => sum + (s.calories || 0), 0);
    const totalTimeSeconds = sessions.reduce((sum, s: any) => sum + (s.durationSec || 0), 0);
    const sessionCount = sessions.length;

    // Calculate target using service method
    const kcalGoal = user.suggestedActivityKcal || 0;
    const weight = user.weight || 0;
    const targetData = weight > 0 
      ? this.runningService.calculateSuggestedActivity(kcalGoal, weight)
      : { suggestedActivity: { kcal: 0, km: 0, timeMinutes: 0 } };

    // Format sessions for frontend
    const formattedSessions = sessions.map((s: any) => ({
      id: s._id.toString(),
      distanceKm: s.distanceKm || 0,
      caloriesBurned: s.calories || 0,
      timeSeconds: s.durationSec || 0,
      date: s.startTime ? new Date(s.startTime).toISOString().split('T')[0] : date || new Date().toISOString().split('T')[0],
      createdAt: s.createdAt || s.startTime,
    }));

    return {
      sessions: formattedSessions,
      summary: {
        totalDistanceKm: parseFloat(totalDistanceKm.toFixed(1)),
        totalCaloriesBurned: Math.round(totalCaloriesBurned),
        totalTimeSeconds: Math.round(totalTimeSeconds),
        sessionCount,
      },
      target: targetData.suggestedActivity,
    };
  }

  /**
   * Get runs for the authenticated user for a given day (YYYY-MM-DD). Defaults to today.
   */
  @Get('me/daily')
  @UseGuards(JwtAuthGuard)
  async getMyDailyRuns(@Req() req: any, @Query('date') date?: string) {
    const userId = req?.user?.sub || req?.user?._id || req?.user?.id || req?.user?.userId;
    if (!userId) return { data: [] };
    const runs = await this.runningService.findRunsByDay(userId.toString(), date);
    return { data: runs };
  }

  /**
   * Calculate suggested activity (distance, time, calories) for the authenticated user
   * based on their suggestedActivityKcal goal and current weight.
   */
  @Get('me/suggested-activity')
  @UseGuards(JwtAuthGuard)
  async getMySuggestedActivity(@Req() req: any) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const kcalGoal = user.suggestedActivityKcal || 0;
    const weight = user.weight || 0;

    if (!weight) {
      throw new BadRequestException('User weight is required to calculate suggested activity');
    }

    return this.runningService.calculateSuggestedActivity(kcalGoal, weight);
  }

  /**
   * Get aggregated running statistics with daily or weekly grouping
   * Query params: startDate, endDate (YYYY-MM-DD), groupBy ('day' or 'week')
   */
  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  async getMyStats(
    @Req() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy: 'day' | 'week'
  ) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    return this.runningService.aggregateStats(user._id.toString(), startDate, endDate, groupBy);
  }
}
