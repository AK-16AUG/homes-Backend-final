import { z } from "zod";

export const propertyCreateSchema = z.object({
  property_name: z.string().min(1),
  description: z.string().min(1),
  rate: z.string().min(1),
  category: z.enum(["rent", "sale"]),
  amenties: z.array(z.string()),
  services: z.array(z.string()),
  images: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional(),
  furnishing_type: z.enum(["Semi-furnished", "Fully furnished", "Raw"]),
  city: z.string().min(1),
  state: z.string().min(1),
  area: z.string().min(1),
  bed: z.coerce.number().optional(),
  bathroom: z.coerce.number().optional(),
  availability: z.coerce.boolean().optional(),
});

export const propertyUpdateSchema = propertyCreateSchema.partial(); 