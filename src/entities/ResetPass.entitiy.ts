import { Schema, model, Document } from "mongoose";


export interface UserType extends Document {
 
  email: string;
  password: string;
  
  isVerified: boolean;
  
  otp:string;
}

const UserPassResetSchema = new Schema<UserType>(
  {
    
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
     
    },
   
    isVerified: {
      type: Boolean,
      default: false,
    },
    
    otp:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);

const ResetPassModel = model<UserType>("ResetPass", UserPassResetSchema);
export default  ResetPassModel;