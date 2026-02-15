import { Schema, model, Document } from "mongoose";

export interface ServiceType extends Document {
    name: string;
}

export interface AmenityType extends Document {
    name: string;
}

export const ServiceSchema = new Schema<ServiceType>({
    name: { type: String, required: true }
});

export const AmenitySchema = new Schema<AmenityType>({
    name: { type: String, required: true }
});

export const ServiceModel = model<ServiceType>("Service", ServiceSchema);
export const AmenityModel = model<AmenityType>("Amenity", AmenitySchema); // ✅ Correct ref name

interface SeedResult {
    amenityIds: string[];
    serviceIds: string[];
}

export async function seedAmenitiesAndServices(): Promise<SeedResult> {
    const amenities = [
        { name: "Wifi" },
        { name: "Parking" },
        { name: "Gym" },
        { name: "Swimming Pool" },
        { name: "Lift" },
        { name: "Power Backup" },
        { name: "Security" },
        { name: "Maintenance Staff" }
    ];

    const services = [
        { name: "Cleaning" },
        { name: "Security" },
        { name: "Laundry" },
        { name: "Cafeteria" },
        { name: "Room Service" },
        { name: "Concierge" },
        { name: "Spa" },
        { name: "Airport Transfer" }
    ];

    await AmenityModel.deleteMany({});
    await ServiceModel.deleteMany({});

    const insertedAmenities = await AmenityModel.insertMany(amenities);
    const insertedServices = await ServiceModel.insertMany(services);

    return {
        amenityIds: insertedAmenities.map((a:any) => a._id.toString()),
        serviceIds: insertedServices.map((s:any) => s._id.toString())
    };
}

