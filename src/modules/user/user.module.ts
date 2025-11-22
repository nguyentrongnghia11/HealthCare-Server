import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongoModule } from 'src/core/database/database.module';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.schema';
import { HealthTracking, HealthTrackingSchema } from './entities/health-tracking.schema';
import { OtpModule } from '../otp/otp.module';
import { NutritionModule } from '../nutrition/nutrition.module';
import { RunningModule } from 'src/running/running.module';

@Module({
  imports: [
    MongoModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: HealthTracking.name, schema: HealthTrackingSchema },
    ]),
    OtpModule,
    NutritionModule,
    RunningModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}




