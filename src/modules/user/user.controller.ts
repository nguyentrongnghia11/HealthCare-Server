import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { NutritionService } from '../nutrition/nutrition.service';
import { RunningService } from 'src/running/running.service';
import { Types } from 'mongoose';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private nutritionService: NutritionService,
    private runningService: RunningService,
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
}