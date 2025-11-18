import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { Injectable } from "@nestjs/common";
import { Request } from "express";


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'identifier', passReqToCallback: true });
        console.log('LocalStrategy initialized');
    }

    async validate(req: Request, identifier: string, password: string): Promise<any> { 
        console.log ("identifier:", identifier);
        console.log ("password:", password);       
        const user = await this.authService.validateUser(identifier, password);
        
        if (!user) {
            throw new Error('Invalid credentials');
        }
        
        console.log('User validated successfully:', user.email);
        return user; 
    }

}