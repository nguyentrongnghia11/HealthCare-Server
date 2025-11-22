import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'sleep_schedules',
  timestamps: true,
})
export class SleepSchedule {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: String, default: '' })
  bedtime: string;

  @Prop({ type: String, default: '' })
  wakeup: string;
}

export type SleepScheduleDocument = HydratedDocument<SleepSchedule>;
export const SleepScheduleSchema = SchemaFactory.createForClass(SleepSchedule);
SleepScheduleSchema.index({ userId: 1, date: 1 }, { unique: true });
