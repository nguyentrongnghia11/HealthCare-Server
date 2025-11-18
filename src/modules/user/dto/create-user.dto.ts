import { IsEmail, IsNotEmpty, IsOptional, isString, IsString, MinLength } from "class-validator";
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string

    @IsEmail()
    email: string

    @IsOptional()
    @IsString()
    @MinLength(8)
    password?: string | null;

    @IsString()
    otpCode?: string;

    @IsString()
    @IsNotEmpty()
    type: string

    @IsString()
    @IsOptional()
    facebook_id?: string
}
