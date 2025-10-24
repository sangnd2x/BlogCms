import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

export interface RequestWithUser extends Request {
  user: User;
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    console.log('USER DECORATOR', request.user);
    return request.user;
  },
);
