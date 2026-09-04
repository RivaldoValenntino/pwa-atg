import { z } from "zod";

export const checkAbsenSchema = z.object({
  type: z.number(),
  location: z.number(),
  latitude: z.string(),
  longitude: z.string(),
});

export type CheckAbsenRequest = z.infer<typeof checkAbsenSchema>;
