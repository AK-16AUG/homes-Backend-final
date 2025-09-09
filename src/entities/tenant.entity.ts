import { Schema, model, Document, Types } from "mongoose";

interface Payment {
  user_id: Types.ObjectId;
  dateOfPayment: Date;
  modeOfPayment: "cash" | "online";
  amount:Number
}

export interface TenantType extends Document {
  name: String;
  users: Types.ObjectId[];
  property_id: Types.ObjectId;
  flatNo: String;
  society: String;
  members: String;
  startDate: Date;
  rent: String;
  property_type: "Pg" | "Normal";
  Payments: Payment[];
}

const TenantSchema = new Schema<TenantType>(
  {
    users: [{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    rent: {
      type: String,
    },
    property_id: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    flatNo: {
      type: String,
    },
    name: {
      type: String,
    },
    society: {
      type: String,
    },
    property_type: {
      type: String,
      enum: ["Pg", "Normal"]
    },
    members: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    Payments: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        dateOfPayment: {
          type: Date,
          required: true,
        },
        amount:{
type:Number
        },
        modeOfPayment: {
          type: String,
          enum: ["cash", "online"],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Tenant = model<TenantType>("Tenant", TenantSchema);
export default Tenant;