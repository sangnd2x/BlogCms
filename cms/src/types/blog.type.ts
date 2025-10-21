import { BaseEntity } from "@/types/base.type";
import { User } from "@/types/user.type";
import { Category } from "@/types/category.type";

export interface Blog extends BaseEntity {
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  tags: string[];
  featured_image: string | null;
  status: BlogStatus;
  published_at: string | null;
  views_count: number;
  is_active: boolean;
  author_id: string;
  category_id: string;

  // relations
  author: User;
  category: Category;
}

export enum BlogStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  SCHEDULED = "SCHEDULED",
}

export interface BlogsParams {
  page?: number;
  limit?: number;
  // filtering
  search?: string;
  title?: string;
  status?: string;
  author_id?: string;
  author?: string;
  category?: string;
  tags?: string;
  published_at?: string;
  // sorting
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
  search_columns?: string;
}
