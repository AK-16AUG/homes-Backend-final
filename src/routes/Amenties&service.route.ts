import { Router, Request, Response } from "express";
import { AmenityModel, ServiceModel } from "../entities/serives&Amenties.entity.js";

const router = Router();

// ✅ POST /create-service
router.post("/create-service", async (req: Request, res: Response) => {
  try {
    const service = new ServiceModel(req.body);
    const savedService = await service.save();
    res.status(201).json({
      message: "Service created successfully",
      data: savedService,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create service",
      error: error.message || error,
    });
  }
});

// ✅ POST /create-amenity
router.post("/create-amenity", async (req: Request, res: Response) => {
  try {
    const amenity = new AmenityModel(req.body);
    const savedAmenity = await amenity.save();
    res.status(201).json({
      message: "Amenity created successfully",
      data: savedAmenity,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create amenity",
      error: error.message || error,
    });
  }
});

// ✅ GET /all - fetch all amenities and services
router.get("/all", async (_req: Request, res: Response) => {
  try {
    const amenities = await AmenityModel.find();
    const services = await ServiceModel.find();

    res.status(200).json({
      message: "Fetched all amenities and services",
      data: {
        amenities,
        services,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch amenities and services",
      error: error.message || error,
    });
  }
});

export default router;
