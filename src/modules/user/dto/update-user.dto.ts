
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityLevel } from '../entities/user.schema';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @IsBoolean()
    gender: boolean

    @Type(() => Date)
    @IsDate()
    birthday: Date

    @IsNumber()
    height: number

    @IsNumber()
    weight: number

    @IsEnum(ActivityLevel)
    activityLevel: ActivityLevel = ActivityLevel.SEDENTARY;

    @IsString()
    @IsEnum(["maintain", "lost", "gain"])
    target: string

    @IsNumber()
    targetTimeDays: number
    
    @IsNumber()
    targetWeight: number

}
