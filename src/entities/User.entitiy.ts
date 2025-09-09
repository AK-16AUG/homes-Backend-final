import { Schema, model, Document } from "mongoose";

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface UserType extends Document {
  User_Name: string;
  phone_no: number;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  address?: Address; 
  otp:string;
}

const UserSchema = new Schema<UserType>(
  {
    User_Name: {
      type: String,
     
    },
    phone_no: {
      type: Number,
     
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
     
    },
    
    role: {
      type: String,
      default: "user",
    
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      postalCode: { type: String, default: "" }
    },
    otp:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);

const User = model<UserType>("User", UserSchema);
export default User;