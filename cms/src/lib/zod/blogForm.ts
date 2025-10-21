import { z } from "zod";
import { BlogStatus } from "@/types/blog.type";

export const blogFormSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(100, "Title must be less than 100 characters").trim(),
  slug: z.string().optional(),
  content: z.string().min(1, "Content cannot be empty"),
  category_id: z.uuid("Invalid category").optional(),
  tags: z.array(z.string()).optional(),
  published_at: z.string().optional(),
  status: z.enum(BlogStatus).optional(),

  author_id: z.uuid(),
});

export type ImageData = {
  id: string;
  file: File;
  preview: string;
};

export type BlogFormData = z.infer<typeof blogFormSchema> & {
  images?: ImageData[];
};
