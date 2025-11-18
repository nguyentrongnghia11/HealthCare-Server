import { Module } from '@nestjs/common';
import { RunningService } from './running.service';
import { RunningController } from './running.controller';

@Module({
  controllers: [RunningController],
  providers: [RunningService],
})
export class RunningModule {}
