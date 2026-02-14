import { Schema, model, Document } from "mongoose";

export interface IVerification extends Document {
    email: string;
    otp: string;
    createdAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        otp: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 600, // OTP expires in 10 minutes
        },
    },
    {
        timestamps: true,
    }
);

const VerificationModel = model<IVerification>("Verification", VerificationSchema);
export default VerificationModel;
