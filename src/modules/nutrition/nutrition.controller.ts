import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
// import { CreateNutritionDto } from './dto/create-nutrition.dto';
// import { UpdateNutritionDto } from './dto/update-nutrition.dto';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post()
  create() {
    return this.nutritionService.create();
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
  update(@Param('id') id: string) {
    return this.nutritionService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nutritionService.remove(+id);
  }
}
