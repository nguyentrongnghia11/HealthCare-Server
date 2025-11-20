import { Module, forwardRef } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { FileSizeValidationPipe } from 'src/utils/fileValidation.util';
import { MongooseModule } from '@nestjs/mongoose';

import { Nutrition, NutritionSchema } from './entities/nutrition.schema';
import { MongoModule } from 'src/core/database/database.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => UserModule), MongoModule, MongooseModule.forFeature([{ name: Nutrition.name, schema: NutritionSchema }])],
  controllers: [NutritionController],
  providers: [NutritionService, FileSizeValidationPipe],
  exports: [NutritionService],
})
export class NutritionModule { }

