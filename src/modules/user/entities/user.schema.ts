
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";


export enum ActivityLevel {
  SEDENTARY = 'sedentary',          // Ít vận động
  LIGHT = 'light',                  // Hoạt động nhẹ
  MODERATE = 'moderate',            // Hoạt động vừa
  ACTIVE = 'active',                // Hoạt động cao
  VERY_ACTIVE = 'very_active',      // Rất cao
}

export const EXERCISE_INTENSITY_FACTOR: Record<ActivityLevel, number> = {
  [ActivityLevel.SEDENTARY]: 1.2,
  [ActivityLevel.LIGHT]: 1.375,
  [ActivityLevel.MODERATE]: 1.55,
  [ActivityLevel.ACTIVE]: 1.725,
  [ActivityLevel.VERY_ACTIVE]: 1.9,
};

@Schema({
  collection: 'users',
  timestamps: true,
  toJSON: {
    transform(doc, ret: any) {

      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;

      return ret;
    },
  },
})

export class User {
  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  email: string

  @Prop({ required: function () { return this.type === 'facebook' }, default: null })
  facebook_id: string

  @Prop({ required: function () { return this.type === 'local' }, default: null })
  passwordHash?: string

  @Prop()
  gender?: boolean

  @Prop()
  birthday: Date

  @Prop()
  height?: number

  @Prop()
  weight?: number

  @Prop({ type: String, enum: ["user", "admin"], default: "user" })
  role: string

  @Prop({ type: [String], enum: ["local", "google", "facebook"] })
  type: string[]

  @Prop({ type: String, required: false })
  pricture_url: string


  @Prop({ type: String, enum: Object.values(ActivityLevel), default: ActivityLevel.SEDENTARY })
  activityLevel: string

  @Prop({ type: String, enum: ["maintain", "lost", "gain"] })
  target: string

  @Prop({ type: Number, default: 0 })
  caloGoal: number;

  @Prop({ type: Number, default: 0 })
  bmr: number;

  @Prop({ type: Number, default: 0 })
  fatGoal: number;

  @Prop({ type: Number, default: 0 })
  proteinGoal: number;

  @Prop({ type: Number, default: 0 })
  carbGoal: number;

  @Prop({ type: Number, default: 0 })
  suggestedActivityKcal: number;
}


export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User)

