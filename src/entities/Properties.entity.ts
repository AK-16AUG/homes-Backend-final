// Properties.entity.ts
import { Document, Schema, model, Types } from "mongoose";
import { AmenityModel, ServiceModel } from "./serives&Amenties.entity.js";

export interface PropertyType extends Document {
  property_name: string;
  description: string;
  rate: string;
  category: "rent" | "sale" | "pg";
  amenities: Types.ObjectId[]; // fixed spelling + ref type
  services: Types.ObjectId[];
  images: string[];
  videos: string[];
  perPersonPrice?: string;
  totalCapacity?: string;
  furnishing_type: "Semi-furnished" | "Fully furnished" | "Raw";
  city: string;
  state: string;
  address: string;
  flat_no?: string;
  scheduledVisit: Types.ObjectId[];
  total_views: number;
  leads: Types.ObjectId[];
  bed: number;
  bathroom: number;
  availability: boolean;
  area: string;
  latitude?: string;
  longitude?: string;
  currentTenant?: Types.ObjectId | null;
}

const PropertySchema = new Schema<PropertyType>(
  {
    property_name: { type: String, required: true },
    description: { type: String, required: true },
    rate: { type: String, required: true },
    category: { type: String, enum: ["rent", "sale", "pg"], required: true },
    amenities: [{ type: Schema.Types.ObjectId, ref: "Amenity" }], // fixed
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    perPersonPrice: { type: String },
    totalCapacity: { type: String }, // added missing comma here ✅
    furnishing_type: {
      type: String,
      enum: ["Semi-furnished", "Fully furnished", "Raw"],
      required: true,
    },
    city: { type: String, required: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    flat_no: { type: String },
    area: { type: String, required: true },
    latitude: { type: String },
    longitude: { type: String },
    scheduledVisit: [{ type: Schema.Types.ObjectId, ref: "Visit" }],
    total_views: { type: Number, default: 0 },
    bed: { type: Number, default: 0 },
    bathroom: { type: Number, default: 0 },
    leads: [{ type: Schema.Types.ObjectId, ref: "User" }],
    availability: { type: Boolean, default: true },
    currentTenant: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export const PropertyModel = model<PropertyType>("Property", PropertySchema);
export default PropertyModel;
