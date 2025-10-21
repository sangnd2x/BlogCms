import { BaseEntity } from "@/types/base.type";

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description: string | null;
  color: string;
  is_active: boolean;
}

export interface CategoriesResponse {
  data: Category[];
  meta :{
    total: number;
  }
}