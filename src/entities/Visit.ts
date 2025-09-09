import { Schema, model, Document } from "mongoose";

 interface VisitType extends Document {
    property_id: string;
    user_id: string;
    status: "Pending" | "visited";
    phone: string;
    schedule_date: Date;
}

const VisitSchema = new Schema<VisitType>({
    property_id: { type: String, required: true, ref: "Property" },
    user_id: { type: String, required: true, ref: "User" },
    status: { type: String, enum: ["Pending", "visited"], default: "Pending" },
    phone: { type: String, required: true },
    schedule_date: { type: Date, required: true }
}, { timestamps: true });

export const VisitModel = model<VisitType>("Visit", VisitSchema);