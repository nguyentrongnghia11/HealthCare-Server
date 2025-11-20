import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { ActivityLevel, EXERCISE_INTENSITY_FACTOR } from '../entities/user.schema';


export class UpdateUserDetailDto extends PartialType(CreateUserDto) {

  @IsBoolean()
  gender: boolean;

  @Type(() => Date)
  @IsDate()
  birthday?: Date;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;

  @IsNumber()
  bmr: number;

  @IsEnum(ActivityLevel)
  activityLevel: ActivityLevel = ActivityLevel.SEDENTARY;

  @IsEnum(["maintain", "lost", "gain"])
  target: string

  @IsNumber()
  caloGoal: number;

  @IsNumber()
  fatGoal: number;

  @IsNumber()
  proteinGoal: number;

  @IsNumber()
  carbGoal: number;
  
  @IsNumber()
  suggestedActivityKcal: number;

  @IsNumber()
  @IsOptional()
  targetWeight?: number;

  @IsNumber()
  @IsOptional()
  targetTimeDays?: number;

}
