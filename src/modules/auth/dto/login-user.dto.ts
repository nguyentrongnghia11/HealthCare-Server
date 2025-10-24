import { IsEmpty, IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class LoginUserDto {
    @ValidateIf(o => !o.email)
    @IsString()
    @IsNotEmpty()
    name?: string;

    @ValidateIf(o => !o.name)
    @IsString()
    @IsNotEmpty()
    email?: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}


