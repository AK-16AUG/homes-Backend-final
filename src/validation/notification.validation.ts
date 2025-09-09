import { z } from "zod";

export const notificationCreateSchema = z.object({
  user_id: z.string().min(1),
  message: z.string().min(1),
  type: z.string().optional(),
  read: z.boolean().optional(),
});

export const notificationUpdateSchema = notificationCreateSchema.partial(); 