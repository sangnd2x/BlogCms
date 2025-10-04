import { BaseEntity } from "@/types/base.type";

export interface Author extends BaseEntity {
  name: string;
  email: string;
  user_role: 'admin' | 'viewer';
  is_active: boolean;
}