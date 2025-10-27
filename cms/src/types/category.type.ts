import { BaseEntity } from "@/types/base.type";

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  blogCount: number;
  description: string | null;
  color: string;
  isActive: boolean;
  createdOn: string | null;
  updatedOn: string | null;
}

export interface CategoriesResponse {
  data: Category[];
  meta: {
    total: number;
  };
}
