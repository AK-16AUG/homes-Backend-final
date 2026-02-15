import mongoose from "mongoose";
import { AmenityModel, ServiceModel } from "../entities/ServicesAmenities.entity.js";
import PropertyModel from "../entities/Properties.entity.js";
import dbConnect from "../db/db.connect.js";

const seedAmenitiesAndServices = async () => {
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

  // Clear existing
  await AmenityModel.deleteMany({});
  await ServiceModel.deleteMany({});

  // Insert and get inserted docs
  const insertedAmenities = await AmenityModel.insertMany(amenities);
  const insertedServices = await ServiceModel.insertMany(services);

  console.log("Amenities and Services seeded successfully!");
  return {
    amenityMap: insertedAmenities.reduce((acc, a: any) => {
      acc[a.name] = a._id;
      return acc;
    }, {} as Record<string, mongoose.Types.ObjectId>),
    serviceMap: insertedServices.reduce((acc, s: any) => {
      acc[s.name] = s._id;
      return acc;
    }, {} as Record<string, mongoose.Types.ObjectId>)
  };
};

const seedProperties = async (amenityMap: Record<string, mongoose.Types.ObjectId>, serviceMap: Record<string, mongoose.Types.ObjectId>) => {
  const imageUrls = [
    "https://server.ekostay.com/public/property_images/67dd568de74de_1.webp",
    "https://media.istockphoto.com/id/506903162/photo/luxurious-villa-with-pool.jpg",
    "https://media.istockphoto.com/id/157527844/photo/modern-apartment.jpg",
    "https://media.istockphoto.com/id/177359763/photo/villa.jpg",
    "https://media.istockphoto.com/id/1170112561/photo/contemporary-home-exterior.jpg"
  ];

  const properties = [
    {
      property_name: "Luxury Apartment",
      description: "A beautiful luxury apartment in the city center.",
      rate: "50000",
      category: "rent",
      latitude: "12.9716",
      longitude: "77.5946",
      amenities: [
        amenityMap["Wifi"],
        amenityMap["Gym"],
        amenityMap["Lift"],
        amenityMap["Maintenance Staff"]
      ],
      services: [
        serviceMap["Security"],
        serviceMap["Laundry"],
        serviceMap["Airport Transfer"]
      ],
      images: [imageUrls[0], imageUrls[0], imageUrls[0]],
      videos: [],
      furnishing_type: "Fully furnished",
      city: "Bangalore",
      state: "Karnataka",
      address: "123 Luxury Lane, Bangalore",
      area: "1500 sqft",
      scheduledVisit: [],
      total_views: 0,
      bed: 3,
      bathroom: 2,
      leads: [],
      availability: true,
      currentTenant: null
    },
    {
      property_name: "Modern Flat",
      description: "Spacious 2BHK flat with modern interiors and sunlight.",
      rate: "30000",
      category: "rent",
      latitude: "23.0225",
      longitude: "72.5714",
      amenities: [
        amenityMap["Parking"],
        amenityMap["Swimming Pool"],
        amenityMap["Power Backup"]
      ],
      services: [
        serviceMap["Cleaning"],
        serviceMap["Cafeteria"]
      ],
      images: [imageUrls[1], imageUrls[1], imageUrls[1]],
      videos: [],
      furnishing_type: "Semi-furnished",
      city: "Ahmedabad",
      state: "Gujarat",
      address: "456 Modern Ave, Ahmedabad",
      area: "1100 sqft",
      scheduledVisit: [],
      total_views: 0,
      bed: 2,
      bathroom: 1,
      leads: [],
      availability: true,
      currentTenant: null
    },
    {
      property_name: "Cozy Studio",
      description: "Compact and affordable studio apartment near IT hub.",
      rate: "15000",
      category: "rent",
      latitude: "17.3850",
      longitude: "78.4867",
      amenities: [
        amenityMap["Wifi"],
        amenityMap["Lift"]
      ],
      services: [
        serviceMap["Cleaning"],
        serviceMap["Laundry"]
      ],
      images: [imageUrls[2], imageUrls[2]],
      videos: [],
      furnishing_type: "Raw",
      city: "Hyderabad",
      state: "Telangana",
      address: "789 Studio St, Hyderabad",
      area: "500 sqft",
      scheduledVisit: [],
      total_views: 0,
      bed: 1,
      bathroom: 1,
      leads: [],
      availability: true,
      currentTenant: null
    },
    {
      property_name: "Beachside Villa",
      description: "Premium sea-facing villa with 5-star facilities.",
      rate: "120000",
      category: "rent",
      latitude: "15.2993",
      longitude: "73.8567",
      amenities: [
        amenityMap["Gym"],
        amenityMap["Swimming Pool"],
        amenityMap["Security"]
      ],
      services: [
        serviceMap["Room Service"],
        serviceMap["Concierge"],
        serviceMap["Spa"]
      ],
      images: [imageUrls[3], imageUrls[3], imageUrls[3]],
      videos: [],
      furnishing_type: "Fully furnished",
      city: "Goa",
      state: "Goa",
      address: "101 Beach Rd, Goa",
      area: "3000 sqft",
      scheduledVisit: [],
      total_views: 0,
      bed: 4,
      bathroom: 3,
      leads: [],
      availability: true,
      currentTenant: null
    },
    {
      property_name: "Urban Duplex",
      description: "High-rise duplex apartment in NCR with panoramic view.",
      rate: "75000",
      category: "rent",
      latitude: "28.7041",
      longitude: "77.1025",
      amenities: [
        amenityMap["Wifi"],
        amenityMap["Parking"],
        amenityMap["Power Backup"],
        amenityMap["Security"]
      ],
      services: [
        serviceMap["Security"],
        serviceMap["Concierge"],
        serviceMap["Airport Transfer"]
      ],
      images: [imageUrls[4], imageUrls[4], imageUrls[4]],
      videos: [],
      furnishing_type: "Fully furnished",
      city: "Delhi",
      state: "Delhi NCR",
      address: "202 Duplex Dr, Delhi",
      area: "2500 sqft",
      scheduledVisit: [],
      total_views: 0,
      bed: 4,
      bathroom: 4,
      leads: [],
      availability: true,
      currentTenant: null
    }
  ];

  await PropertyModel.deleteMany({});
  await PropertyModel.insertMany(properties);
  console.log("Properties seeded successfully!");
};

async function runSeed() {
  try {
    await dbConnect();

    console.log("Seeding amenities and services...");
    const { amenityMap, serviceMap } = await seedAmenitiesAndServices();

    console.log("Seeding properties...");
    await seedProperties(amenityMap, serviceMap);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Database seeding failed:", error);
  } finally {
    process.exit(0);
  }
}

runSeed();
