import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";

import { UserService } from "src/modules/user/user.service";
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from 'src/utils/password.util';
import { User } from "src/modules/user/entities/user.schema";
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthGuads implements CanActivate {

    private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request: Request = context.switchToHttp().getRequest()

        const { idToken } = request.body as any


        console.log ("id token ", idToken)
        if (!idToken) {
            throw new UnauthorizedException('Missing Google ID token');
        }

        try {
            const ticket = await this.client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload: any = ticket.getPayload();

            if (payload) {
                (request as any).payload = payload;
                return true;
            }
            else {
                throw new UnauthorizedException('Invalid Google token payload');
            }
        } catch (error) {
            console.error('GoogleAuthGuard error:', error);
            throw new UnauthorizedException('Invalid Google ID token');
        }
    }

}