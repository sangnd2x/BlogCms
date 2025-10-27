export class CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  blogCount: number;
  isActive: boolean;
  createdOn: Date;
  updatedOn: Date;
}
