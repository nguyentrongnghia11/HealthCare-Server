
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";

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

  @Prop({ type: String, enum: ["local", "google", "facebook"] })
  type: string

}


export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User)

