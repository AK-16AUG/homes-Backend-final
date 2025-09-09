import mongoose, { Schema, Document, Model } from "mongoose";

interface IAppointment extends Document {
  user_id: mongoose.Types.ObjectId;
  property_id: mongoose.Types.ObjectId;
  phone?: string;
  status: string;
   whatsappUpdates:boolean;
   schedule_Time:Date;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema<IAppointment> = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    phone: {
      type: String,
    },
     whatsappUpdates:{
type: Boolean
     },
    status: {
      type: String,
      default: "Pending",
    },
    schedule_Time:{
type:Date
    }
  },
  {
    timestamps: true,
  }
);

const Appointment: Model<IAppointment> = mongoose.model<IAppointment>(
  "Appointment",
  AppointmentSchema
);

export { IAppointment, Appointment };
