import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from 'src/utils/password.util';
import { User, UserDocument } from '../user/entities/user.schema';
import { OAuth2Client } from 'google-auth-library';
import { generateTokens } from 'src/utils/generateToken.utill';
@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly passwordService: PasswordService,
        @Inject('GOOGLE_CLIENT') private readonly client: OAuth2Client,

    ) { console.log("Khoi tao authservice") }

    async login(user: any) {
        const payload = { username: user.name, email: user.email, sub: user._id, role: user.role };

        const { access_token, refresh_token } = generateTokens(this.jwtService, payload);
        return {
            access_token,
            refresh_token,
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



    async loginGoogle(payload: any) {

        let existingUser:UserDocument | null  = await this.userService.findOneByEmail(payload.email) ;
        console.log("hahah")
        if (!existingUser) {
            console.log("not exists")
            const userDto = {
                username: payload.name,
                email: payload.email,
                type: 'google',
                password: null,
            };
            try {
                existingUser = await this.userService.create(userDto);

            } catch (error) {
                console.error('Lỗi khi tạo tài khoản Google:', error);
                throw new InternalServerErrorException('Không thể tạo tài khoản Google mới.');
            }
        }
        else {
            console.log("exists")
            await this.userService.addType(existingUser._id.toString(), "google")
        }

        const payload_token = { username: existingUser.username, email: existingUser.email, sub: existingUser._id, role: existingUser.role };
        const res = await this.login(payload_token)
        return res;
    }


    async loginFacebook(payload: any) {
        let existingUser:UserDocument | null  = await this.userService.findOneByFacebook(payload.id) ;
        console.log("hahah")
        if (!existingUser) {
            console.log("not exists")
            const userDto = {
                username: payload.name,
                email: payload.email,
                type: 'facebook',
                password: null,
                facebook_id: payload.id
            };
            try {
                existingUser = await this.userService.create(userDto);

            } catch (error) {
                console.error('Lỗi khi tạo tài khoản Google:', error);
                throw new InternalServerErrorException('Không thể tạo tài khoản Google mới.');
            }
        }
        else {
            console.log("exists")
            await this.userService.addType(existingUser._id.toString(), "facebook")
        }

        const payload_token = { username: existingUser.username, email: existingUser.email, sub: existingUser._id, role: existingUser.role };
        const res = await this.login(payload_token)
        return res;
    }
}





