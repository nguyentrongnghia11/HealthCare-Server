import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { NutritionService } from '../nutrition/nutrition.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private nutritionService: NutritionService) { }

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

  // Update current authenticated user's detail using JWT
  @Patch('me/detail')
  @UseGuards(AuthGuard('jwt'))
  async updateMyDetail(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    console.log('PATCH /user/me/detail headers.authorization =>', req?.headers?.authorization);
    const userId = req?.user?.sub || req?.user?._id || req?.user?.id || req?.user?.userId;
    if (!userId) {
      throw new BadRequestException('Cannot determine user from token');
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
    userDetailDto.suggestedActivityKcal = macroGoals.suggestedActivityKcal

    return this.userService.updateDetail(userId.toString(), userDetailDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Patch(':id/detail')
  async updateDetail(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
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
    return this.userService.remove(+id);
  }
}
