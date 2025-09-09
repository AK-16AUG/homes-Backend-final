import { z } from "zod";

export const leadsCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  status: z.string().optional(),
  property: z.string().optional(),
  message: z.string().optional(),
});

export const leadsUpdateSchema = leadsCreateSchema.partial(); 