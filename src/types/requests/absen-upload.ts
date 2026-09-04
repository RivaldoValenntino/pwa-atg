import { z } from "zod";

export const absenUploadSchema = z.object({
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  filename_face: z.string().min(1, "Filename for face is required"), // Required
  filename_location: z.string().nullable().optional(),
  filename_letter: z.string().nullable().optional(),   
  type: z.string().min(1, "Type is required"),
  location: z.string().min(1, "Location is required"),
  device_token: z.string().min(1, "Device token is required"),
});

// Type inferred from the schema
export type AbsenUploadRequest = z.infer<typeof absenUploadSchema>;
