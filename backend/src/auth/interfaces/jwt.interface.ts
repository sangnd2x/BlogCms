import { UserRoleEnum } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  username: string;
  email?: string;
  iat?: number;
  exp?: number;
  role: UserRoleEnum;
}
