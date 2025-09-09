import { z } from "zod";

export const targetSetSchema = z.object({
  key: z.string().min(1),
  value: z.number(),
});

export const targetUpdateSchema = z.object({
  value: z.number(),
}); 