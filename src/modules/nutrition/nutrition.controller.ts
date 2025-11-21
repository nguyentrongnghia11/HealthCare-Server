import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UploadedFiles, Request, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NutritionService } from './nutrition.service';
import { CreateNutritionDto } from './dto/create-nutrition.dto';
import { UpdateNutritionDto } from './dto/update-nutrition.dto';
import { ManualNutritionDto } from './dto/manual-nutrition.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService,
    private readonly userService: UserService
  ) { }

  @Post()
  create(@Body() createNutritionDto: CreateNutritionDto) {
    return this.nutritionService.create(createNutritionDto);
  }

  @Get()
  findAll() {
    return this.nutritionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nutritionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNutritionDto: UpdateNutritionDto) {
    return this.nutritionService.update(+id, updateNutritionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nutritionService.remove(+id);
  }

  @Post('analyze')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files', 5))
  async analyze(@UploadedFiles() files: Express.Multer.File[], @Request() req: any) {
    console.log('list files ', files);
    const result = await this.nutritionService.analyzeImages(files);
    console.log('day la result ', result)

    if (result) {
      const { email } = req?.user;
      console.log ("email from token ", email)
      const user = await this.userService.findOneByEmail(email);
      console.log ("user from token ", user)
      if (user) {
        (result as any).userId = user._id;
        console.log ("userId to save meal ", result)
        const newMeal = await this.nutritionService.create(result as any);
        return newMeal ? { data: newMeal } : { message: 'No analysis result available.' };
      }

      // AuthGuard ensures authentication, but in case req.user missing, return analysis
      return { data: result, message: 'Analysis complete (no userId found on token).' };
    }

    return { message: 'No analysis result available.' };
  }

  /**
   * Get meals for the current authenticated user for a specific day.
   * Query param: `date=YYYY-MM-DD` (optional, defaults to today)
   */
  @Get('me/daily')
  @UseGuards(JwtAuthGuard)
  async getMyDailyMeals(@Req() req: any, @Query('date') date?: string) {
    const userId = req?.user?.sub || req?.user?._id || req?.user?.id || req?.user?.userId;
    if (!userId) {
      return { data: [], message: 'No user context found in token.' };
    }

    const meals = await this.nutritionService.findMealsByDay(userId.toString(), date);
    return { data: meals };
  }

  /**
   * Add nutrition manually (without AI analysis)
   * Body: { foodName, calories, protein, carbs, fat, date? }
   */
  @Post('me/manual')
  @UseGuards(JwtAuthGuard)
  async addManualNutrition(@Req() req: any, @Body() body: ManualNutritionDto) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const nutritionData: CreateNutritionDto = {
      userId: user._id.toString(),
      foodName: body.foodName,
      calories: body.calories,
      protein: body.protein,
      carbs: body.carbs,
      fat: body.fat,
    };

    const result = await this.nutritionService.create(nutritionData);
    return { data: result };
  }

  /**
   * Get aggregated nutrition statistics with daily or weekly grouping
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

    return this.nutritionService.aggregateStats(user._id.toString(), startDate, endDate, groupBy);
  }
}
