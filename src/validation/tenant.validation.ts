import { z } from "zod";

export const tenantCreateSchema = z.object({
  name: z.string().min(1),
  users: z.array(z.string()),
  property_id: z.string().min(1),
  flatNo: z.string().min(1),
  society: z.string().min(1),
  members: z.string().min(1),
  startDate: z.coerce.date(),
  rent: z.string().min(1),
  property_type: z.enum(["Pg", "Normal"]),
  Payments: z.array(z.object({
    dateOfPayment: z.coerce.date(),
    modeOfPayment: z.enum(["cash", "online"]),
    user_id: z.string().min(1),
  })).optional(),
});

export const tenantUpdateSchema = tenantCreateSchema.partial(); 