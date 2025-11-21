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

    @IsOptional()
    @IsString()
    otpCode?: string;

    @IsString()
    @IsNotEmpty()
    type: string

    @IsString()
    @IsOptional()
    facebook_id?: string

    @IsOptional()
    @IsString()
    role?: string;
}
