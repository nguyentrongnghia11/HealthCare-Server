
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityLevel } from '../entities/user.schema';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @IsOptional()
    @IsBoolean()
    gender: boolean

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    birthday: Date

    @IsOptional()
    @IsNumber()
    height: number

    @IsOptional()
    @IsNumber()
    weight: number

    @IsEnum(ActivityLevel)
    @IsOptional()
    activityLevel: ActivityLevel = ActivityLevel.SEDENTARY;

    @IsOptional()
    @IsString()
    @IsEnum(["maintain", "lost", "gain"])
    target: string

    @IsOptional()
    @IsNumber()
    targetTimeDays: number
    
    @IsOptional()
    @IsNumber()
    targetWeight: number

}
