import { z } from "zod";

export const userCreateSchema = z.object({
  User_Name: z.string().min(1),
  phone_no: z.number(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().optional(),
  isVerified: z.boolean().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  otp: z.string().optional(),
});

export const userUpdateSchema = userCreateSchema.partial(); 