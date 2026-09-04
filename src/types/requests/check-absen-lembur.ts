import { z } from "zod";

export const checkAbsenLemburSchema = z.object({
  type: z.number(),
  is_location: z.string(),
  latitude: z.string(),
  longitude: z.string(),
});

export type CheckAbsenLemburRequest = z.infer<typeof checkAbsenLemburSchema>;
