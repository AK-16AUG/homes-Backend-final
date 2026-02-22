import { Schema, model, Document, Types } from "mongoose";

export interface NotificationType extends Document {
  user_id: Types.ObjectId;
  property_id: Types.ObjectId;
  description: string;
  adminOnly?: boolean
}

const NotificationSchema = new Schema<NotificationType>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    property_id: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    adminOnly: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const Notification = model<NotificationType>("Notification", NotificationSchema);
export default Notification;
