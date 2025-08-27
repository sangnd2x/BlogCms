import { UserRole } from '../../user/entities/user.entity';

export interface JwtPayload {
  sub: string;
  username: string;
  email?: string;
  iat?: number;
  exp?: number;
  role: UserRole;
}
