import { IsNumber, IsString, isString, Validate } from "class-validator";

export class CreateNutritionDto {

    @IsString()
    userId: string;
    
    
    @IsString()
    foodName: string;

    @IsNumber()
    calories: number;
    
    
    @IsNumber()
    protein: number;
    
    
    @IsNumber()
    carbs: number;
    
    @IsNumber()
    fat: number;
}


