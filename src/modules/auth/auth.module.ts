import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { PasswordService } from 'src/utils/password.util';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleClientProvider } from './google.provider';



@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    PassportModule.register({ defaultStrategy: 'google' })
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, PasswordService, LocalAuthGuard, GoogleClientProvider],
  exports: [AuthService],
})
export class AuthModule {}
