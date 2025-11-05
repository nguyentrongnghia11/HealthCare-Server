import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) 
export class Otp extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  otpCode: string;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
OtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });