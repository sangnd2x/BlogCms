import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from '@prisma/client';
import { RequestWithUser } from '../../common/decorators/user.decorator';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('ADMIN GUARD', user);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.userRole !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
