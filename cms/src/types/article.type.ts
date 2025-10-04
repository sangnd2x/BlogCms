import { BaseEntity } from "@/types/base.type";
import { Author } from "@/types/author.type";
import { Category } from "@/types/category.type";

export interface Article extends BaseEntity {
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  tags: string[];
  featured_image: string | null;
  status: ArticleStatus;
  published_at: string | null;
  views_count: number;
  is_active: boolean;
  author_id: string;
  category_id: string;

  // relations
  author: Author;
  category: Category;
}

export interface ArticlesResponse {
  data: Article[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}