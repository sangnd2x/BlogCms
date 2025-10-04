export interface BaseEntity {
  id: string;
  created_on: string;
  created_by: string | null;
  updated_on: string;
  updated_by: string | null;
  deleted_on: string | null;
  deleted_by: string | null;
}
