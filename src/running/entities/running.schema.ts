import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ collection: 'runnings', timestamps: true })
export class Running extends Document {
	@Prop({ type: String, ref: 'User', required: true })
	userId: string;

	@Prop({ type: Number, required: true })
	distanceKm: number; // kilometers

	@Prop({ type: Number, required: true })
	durationSec: number; // duration in seconds

	@Prop({ type: Number, required: false, default: 0 })
	calories: number;

	@Prop({ type: Date, required: true })
	startTime: Date;

	@Prop({ type: Array, required: false, default: [] })
	route: Array<any>;
}

export type RunningDocument = HydratedDocument<Running>;
export const RunningSchema = SchemaFactory.createForClass(Running);
