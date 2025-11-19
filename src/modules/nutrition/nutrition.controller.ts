import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UploadedFiles, Request, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NutritionService } from './nutrition.service';
import { CreateNutritionDto } from './dto/create-nutrition.dto';
import { UpdateNutritionDto } from './dto/update-nutrition.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) { }

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
    console.log('day la result ', result);

    if (result) {
      const userId = req?.user?.sub || req?.user?._id || req?.user?.id || req?.user?.userId;
      if (userId) {
        (result as any).userId = userId;
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
}

