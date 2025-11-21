import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ManualNutritionDto {
  @IsString()
  foodName: string;

  @IsNumber()
  @Min(0)
  calories: number;

  @IsNumber()
  @Min(0)
  protein: number;

  @IsNumber()
  @Min(0)
  carbs: number;

  @IsNumber()
  @Min(0)
  fat: number;

  @IsOptional()
  @IsString()
  date?: string; // YYYY-MM-DD format, optional
}
