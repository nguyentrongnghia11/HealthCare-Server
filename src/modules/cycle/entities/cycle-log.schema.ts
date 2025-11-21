// src/modules/cycle/entities/cycle-log.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CycleLogDocument = CycleLog & Document;

/**
 * Lưu trữ lịch sử các kỳ kinh đã qua
 */
@Schema({ timestamps: true })
export class CycleLog {
  /** ID Người dùng */
  @Prop({ required: true, index: true })
  userId: string;

  /** Ngày bắt đầu kỳ kinh */
  @Prop({ required: true, type: Date })
  startDate: Date;

  /** Ngày kết thúc kỳ kinh */
  @Prop({ required: false, type: Date })
  endDate: Date;

  /** Độ dài của kỳ kinh (Ngày kết thúc - Ngày bắt đầu + 1) */
  @Prop({ required: false, type: Number })
  periodLength: number;

  /** Chiều dài của chu kỳ này (nếu đã kết thúc) */
  @Prop({ required: false, type: Number })
  cycleLength: number;
}

export const CycleLogSchema = SchemaFactory.createForClass(CycleLog);