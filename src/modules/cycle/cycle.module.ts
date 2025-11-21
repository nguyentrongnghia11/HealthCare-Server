// src/modules/cycle/cycle.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // <-- Import MongooseModule
import { CycleService } from './cycle.service';
import { CycleController } from './cycle.controller';
import { CycleLog, CycleLogSchema } from './entities/cycle-log.schema';
import { SymptomEntry, SymptomEntrySchema } from './entities/symptom-entry.schema';

@Module({
  imports: [
    // Đăng ký Schemas để Mongoose có thể inject Model vào Service
    MongooseModule.forFeature([
      { name: CycleLog.name, schema: CycleLogSchema },
      { name: SymptomEntry.name, schema: SymptomEntrySchema },
    ]),
  ],
  controllers: [CycleController],
  providers: [CycleService],
  exports: [CycleService], // Có thể export nếu module khác cần dùng
})
export class CycleModule {}