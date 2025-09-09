import { Schema, model, Document } from "mongoose";

export interface TargetType extends Document {
  key: string;
  value: number;
}

const TargetSchema = new Schema<TargetType>({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
});

const Target = model<TargetType>("Target", TargetSchema);
export default Target; 