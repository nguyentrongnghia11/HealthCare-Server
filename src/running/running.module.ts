import { Module, forwardRef } from '@nestjs/common';
import { RunningService } from './running.service';
import { RunningController } from './running.controller';
import { MongoModule } from 'src/core/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Running, RunningSchema } from './entities/running.schema';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    MongoModule,
    MongooseModule.forFeature([{ name: Running.name, schema: RunningSchema }]),
    forwardRef(() => UserModule),
  ],
  controllers: [RunningController],
  providers: [RunningService],
  exports: [RunningService],
})
export class RunningModule {}
