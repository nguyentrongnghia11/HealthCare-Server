import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from 'src/utils/password.util';
import { User } from '../user/entities/user.schema';
@Injectable()
export class AuthService  {

    constructor(private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly passwordService: PasswordService

    ) { console.log ("Khoi tao authservice") }

    async login(user: any) {
        const payload = { username: user.name, email: user.email, sub: user._id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }

    async validateUser(identifier: string, password: string) {
        console.log('validateUser - identifier:', identifier);
        
        let user: any = await this.userService.findOneByEmail(identifier);
        if (!user) {
            user = await this.userService.findOneByName(identifier);
        }
        
        console.log('User found:', user ? 'Yes' : 'No');
        if (!user) return null;

        const { passwordHash } = user;
        // const isPasswordValid = this.passwordService.comparePassword(password, passwordHash || "");

        // console.log("Password valid:", isPasswordValid);

        // if (!isPasswordValid) return null;
        return user;
    }

    async logout() {

    }

    async refreshToken() {



    }


}
