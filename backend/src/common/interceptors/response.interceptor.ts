import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta?: any;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response<T>>();

    return next.handle().pipe(
      map((data): Response<T> => {
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'meta' in data
        ) {
          return {
            success: true,
            statusCode: response.statusCode,
            message: data.message,
            data: data.data,
            meta: data.meta,
          };
        }

        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'message' in data
        ) {
          return {
            success: true,
            statusCode: response.statusCode,
            message: data.message,
            data: data.data,
          };
        }

        return {
          success: true,
          statusCode: response.statusCode,
          message: response.message,
          data,
          meta: response.meta,
        };
      }),
    );
  }
}
