import { z } from "zod"

export const pengajuanIzinInsertSchema = z.object({
    reason: z.string().min(1, "Reason is required"),
    description: z.string().min(1, "Description is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    filename: z.string().min(1, "Filename is required"),
});

export type PengajuanIzinInsertRequest = z.infer<typeof pengajuanIzinInsertSchema>;