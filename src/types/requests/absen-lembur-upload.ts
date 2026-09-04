import { z } from "zod";

export const absenLemburUploadSchema = z.object({
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  filename_face: z.string().min(1, "Filename for face is required"), // Required
  filename_location: z.string().min(1, "Filename for location is required"),
  type: z.string().min(1, "Type is required"),
  location: z.string().min(1, "Location is required"),
  device_token: z.string().min(1, "Device token is required"),
});

// Type inferred from the schema
export type AbsenLemburUploadRequest = z.infer<typeof absenLemburUploadSchema>;
