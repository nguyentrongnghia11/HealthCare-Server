import { Module } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { FileSizeValidationPipe } from 'src/utils/fileValidation.util';

@Module({
  controllers: [NutritionController],
  providers: [NutritionService, FileSizeValidationPipe],
})
export class NutritionModule {}
