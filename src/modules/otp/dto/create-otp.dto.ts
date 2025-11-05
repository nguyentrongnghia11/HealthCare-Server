import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
export class CreateOTPDto {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsEmail()
    otpCode: string

}
