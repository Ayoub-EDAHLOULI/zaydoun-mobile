import { z } from "zod";

export const uploadBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  author: z.string().max(255).optional(),
  language: z
    .string()
    .length(2, "Use a 2-letter ISO code (e.g. ar, en, fr)")
    .toLowerCase()
    .default("ar"),
});

export type UploadBookFormData = z.infer<typeof uploadBookSchema>;
