import { z } from "zod";

export const categorySchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
  color: z.string(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
