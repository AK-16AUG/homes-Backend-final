// Properties.entity.ts
import { Document, Schema, model } from "mongoose";
import { AmenityModel, ServiceModel } from "./serives&Amenties.entity.js";


export interface PropertyType extends Document {
  property_name: string;
  description: string;
  rate: string;
  category: "rent" | "sale";
  amenties: string[];
  services: string[];
  images: string[];
  videos: string[];
  furnishing_type: "Semi-furnished" | "Fully furnished" | "Raw";
  city: string;
  state: string;
  scheduledVisit: string[];
  total_views: number;
  leads: string[];
  bed: number;
  bathroom: number;
  availability: boolean;
  area:string
  latitude: string;
  longitude: string;
  currentTenant?: string;
}

const PropertySchema = new Schema<PropertyType>(
  {
    property_name: { type: String, required: true },
    description: { type: String, required: true },
    rate: { type: String, required: true },
    category: { type: String, enum: ["rent", "sale"], required: true },
    amenties: [{ type: Schema.Types.ObjectId, ref: "Amenity" }],
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }], 
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    furnishing_type: {
      type: String,
      enum: ["Semi-furnished", "Fully furnished", "Raw"],
      required: true,
    },
    city: { type: String, required: true },
    state: { type: String, required: true },
    area: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    scheduledVisit: [{ type: String, ref: "Visit" }],
    total_views: { type: Number, default: 0 },
    bed: { type: Number, default: 0 },
    bathroom: { type: Number, default: 0 },
    leads: [{ type: String, ref: "User" }],
    availability: { type: Boolean, default: true },
    currentTenant: { type: String, ref: "User", default: null },
  },
  { timestamps: true }
);



export const PropertyModel = model<PropertyType>("Property", PropertySchema);
export default PropertyModel;