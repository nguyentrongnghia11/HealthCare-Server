// src/modules/cycle/entities/symptom-entry.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SymptomEntryDocument = SymptomEntry & Document;

/**
 * Lưu trữ các mục nhật ký hàng ngày (triệu chứng, tâm trạng, hoạt động)
 */
@Schema({ timestamps: true })
export class SymptomEntry {
  /** ID Người dùng */
  @Prop({ required: true, index: true })
  userId: string;

  /** Ngày ghi nhật ký */
  @Prop({ required: true, type: Date })
  date: Date;

  /** Tên triệu chứng (ví dụ: 'Cramps') */
  @Prop({ required: true })
  name: string;

  /** Cường độ (1-5) */
  @Prop({ required: false, type: Number })
  intensity: number;

  /** Ghi chú chi tiết */
  @Prop({ required: false })
  notes: string;
}

export const SymptomEntrySchema = SchemaFactory.createForClass(SymptomEntry);