import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    id: string

    @IsString()
    username: string

    @IsString()
    email: string

    @IsString()
    password?: string

    @IsBoolean()
    gender?: boolean

    @IsDate()
    birthday: Date

    @IsNumber()
    height?: number

    @IsNumber()
    weight?: number

    @IsString()
    role?: string
}
