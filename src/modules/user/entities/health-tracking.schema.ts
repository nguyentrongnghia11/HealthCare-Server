import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({
  collection: 'health_tracking',
  timestamps: true,
})
export class HealthTracking {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: Number, default: 0 })
  steps: number;

  @Prop({ type: Number, default: 0 })
  waterMl: number;

  @Prop({ type: Number, default: 0 })
  sleepMinutes: number;
  
  @Prop({ type: String, default: '' })
  bedtime: string;

  @Prop({ type: String, default: '' })
  wakeup: string;
}

export type HealthTrackingDocument = HydratedDocument<HealthTracking>;
export const HealthTrackingSchema = SchemaFactory.createForClass(HealthTracking);

// Index for faster queries
HealthTrackingSchema.index({ userId: 1, date: 1 }, { unique: true });
