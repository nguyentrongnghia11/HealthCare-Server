import { Module } from '@nestjs/common';
import { RunningService } from './running.service';
import { RunningController } from './running.controller';
import { MongoModule } from 'src/core/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Running, RunningSchema } from './entities/running.schema';

@Module({
  imports: [MongoModule, MongooseModule.forFeature([{ name: Running.name, schema: RunningSchema }])],
  controllers: [RunningController],
  providers: [RunningService],
  exports: [RunningService],
})
export class RunningModule {}
