import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";

@Schema({
    collection: 'nutritions',
    timestamps: true,
})
export class Nutrition extends Document {
    @Prop({ type: String, ref: 'User', required: true })
    userId: string;
    
    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({ type: String, required: true, enum: ['breakfast', 'lunch', 'dinner', 'snack'] })
    mealType: string;

    @Prop({ type: [String], required: true, default: [] })
    foodName: string[];

    @Prop({ type: Number, required: true })
    calories: number;
    
    @Prop({ type: Number, required: true })
    protein: number;
    
    @Prop({ type: Number, required: true })
    carbs: number;
    
    @Prop({ type: Number, required: true })
    fat: number;
    
    @Prop({ type: String })
    exercise?: string;

    @Prop({ type: Number })
    exerciseTime?: number; // in minutes

}

export type NutritionDocument = HydratedDocument<Nutrition>;
export const NutritionSchema = SchemaFactory.createForClass(Nutrition);
