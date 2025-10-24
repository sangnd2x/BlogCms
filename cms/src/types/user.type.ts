import { BaseEntity } from "@/types/base.type";

export interface User extends BaseEntity {
  name: string;
  email: string;
  userRole: "admin" | "viewer";
  isActive: boolean;
}

export interface UsersResponse {
  data: User[];
}
