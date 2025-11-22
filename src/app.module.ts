import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { MongoModule } from './core/database/database.module'
import { ConfigModule } from '@nestjs/config';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { PostsModule } from './modules/posts/posts.module';
import { AiModule } from './modules/ai/ai.module';
import { OtpModule } from './modules/otp/otp.module';
import { RunningModule } from './running/running.module';



@Module({
  imports: [UserModule, AuthModule, MongoModule, ConfigModule.forRoot({ isGlobal: true }), NutritionModule, AiModule, OtpModule, RunningModule, PostsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
