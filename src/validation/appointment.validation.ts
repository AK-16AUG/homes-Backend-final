import { z } from "zod";

export const appointmentCreateSchema = z.object({
  user_id: z.string().min(1),
  property_id: z.string().min(1),
  phone: z.string().optional(),
  status: z.string().optional(),
  schedule_Time: z.coerce.date().optional(),
});

export const appointmentUpdateSchema = appointmentCreateSchema.partial(); 