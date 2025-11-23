import { Inject, Injectable, InternalServerErrorException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from 'src/utils/password.util';
import { User, UserDocument } from '../user/entities/user.schema';
import { OAuth2Client } from 'google-auth-library';
import { generateTokens } from 'src/utils/generateToken.utill';
import { ChangePasswordDto } from './dto/change-password.dto';
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

    // async validateUser(identifier: string, password: string) {
    //     console.log('validateUser - identifier:', identifier);

    //     let user: any = await this.userService.findOneByEmail(identifier);
    //     if (!user) {
    //         user = await this.userService.findOneByName(identifier);
    //     }

    //     console.log('User found:', user ? 'Yes' : 'No');
    //     if (!user) return null;

    //     const { passwordHash } = user;
    //     // const isPasswordValid = this.passwordService.comparePassword(password, passwordHash || "");

    //     // console.log("Password valid:", isPasswordValid);

    //     // if (!isPasswordValid) return null;
    //     return user;
    // }

    async validateUser(identifier: string, password: string) {
    console.log('-------------------------------------------');
    console.log('🔍 BE [validateUser]: Đang kiểm tra đăng nhập');
    console.log('👉 Identifier (Email/User) nhận được:', identifier);
    console.log('👉 Password nhận được:', password);

    // 1. Tìm User
    let user: any = await this.userService.findOneByEmail(identifier);
    if (!user) {
        user = await this.userService.findOneByName(identifier);
    }

    if (!user) {
        console.log('❌ BE: Không tìm thấy User trong Database!');
        return null; // Trả về null => Frontend nhận lỗi 401 Unauthorized
    }

    console.log('✅ BE: Đã tìm thấy User:', { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        hasPasswordHash: !!user.passwordHash 
    });

    // 2. Kiểm tra mật khẩu
    // (LƯU Ý: Bạn cần uncomment đoạn check pass này để test thật)
    if (user.passwordHash) {
         // const isMatch = await this.passwordService.comparePassword(password, user.passwordHash);
         
         // Tạm thời log so sánh thô nếu bạn chưa hash (chỉ dùng để debug)
         const isMatch = password === user.passwordHash; 
         
         console.log(`🔐 BE: Check Pass: Nhập [${password}] vs DB [${user.passwordHash}] => Kết quả: ${isMatch}`);

         if (!isMatch) {
             console.log('❌ BE: Sai mật khẩu!');
             return null;
         }
    } else {
        console.log('⚠️ BE: User này không có passwordHash (Có thể là user Google/FB?)');
    }

    console.log('🎉 BE: Login hợp lệ! Cho phép đi tiếp.');
    return user;
}

    async logout() {

    }

    async verifyToken(token: string) {
        try {
            const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'super-secret-key';
            const payload = this.jwtService.verify(token, { secret });
            return { valid: true, payload };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    async refreshToken(refreshToken: string) {
        try {
            const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'super-secret-key';
            const payload = this.jwtService.verify(refreshToken, { secret });
            
            // Generate new access token with same payload
            const newPayload = { username: payload.username, email: payload.email, sub: payload.sub, role: payload.role };
            const { access_token } = generateTokens(this.jwtService, newPayload);
            
            return { access_token };
        } catch (error) {
            throw new InternalServerErrorException('Invalid or expired refresh token');
        }
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

    /**
     * Change password for local account
     */
    async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
        const user = await this.userService.findOneById(userId);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Verify current password
        if (!user.passwordHash) {
            throw new BadRequestException('No password set for this account');
        }

        const isCurrentPasswordValid = changePasswordDto.currentPassword === user.passwordHash;
        // For production: const isCurrentPasswordValid = await this.passwordService.comparePassword(changePasswordDto.currentPassword, user.passwordHash);
        
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Check if new password is same as current
        if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
            throw new BadRequestException('New password must be different from current password');
        }

        // Update password (for now storing plain text, should hash in production)
        const newPasswordHash = changePasswordDto.newPassword;
        // For production: const newPasswordHash = await this.passwordService.hashPassword(changePasswordDto.newPassword);
        
        await this.userService.update(userId, { passwordHash: newPasswordHash } as any);
    }
}





