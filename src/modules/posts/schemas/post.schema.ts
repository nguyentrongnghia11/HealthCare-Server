import { Schema } from 'mongoose';

export const PostSchema = new Schema({
  id: { type: Number, required: true, unique: true, index: true },
  title: { type: String, required: true },
  excerpt: { type: String },
  content: { type: String },
  image: { type: String },
  date: { type: String },
  type: { type: String, enum: ['nutrition', 'sport', 'work_out'], default: '' },
});
