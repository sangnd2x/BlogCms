import { BaseEntity } from "@/types/base.type";

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description: string | null;
  color: string;
  isActive: boolean;
}

export interface CategoriesResponse {
  data: Category[];
  meta: {
    total: number;
  };
}
