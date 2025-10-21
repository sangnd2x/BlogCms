import { BaseEntity } from "@/types/base.type";

export interface User extends BaseEntity {
  name: string;
  email: string;
  user_role: 'admin' | 'viewer';
  is_active: boolean;
}

export interface UsersResponse {
  data: User[];
}