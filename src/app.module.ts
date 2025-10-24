import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { MongoModule } from './core/database/database.module'
import { ConfigModule } from '@nestjs/config';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { AiModule } from './modules/ai/ai.module';



@Module({
  imports: [UserModule, AuthModule, MongoModule, ConfigModule.forRoot({ isGlobal: true }), NutritionModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
