import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  success: boolean;
  statusCode: number;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any[] | undefined;

    // Handle HttpException (NestJS exceptions)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;

        // Handle validation errors from class-validator
        if (Array.isArray(resp.message)) {
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
          details = this.formatValidationErrors(resp.message);
        } else {
          message = resp.message || exception.message;
          code = resp.error || this.getErrorCode(status);
        }
      } else {
        message = exceptionResponse as string;
        code = this.getErrorCode(status);
      }
    }
    // Handle other errors (e.g., database errors, unexpected errors)
    else if (exception instanceof Error) {
      message = exception.message;
      code = 'INTERNAL_SERVER_ERROR';
    }

    // Build error response
    const errorResponse: ErrorResponse = {
      success: false,
      statusCode: status,
      error: {
        code,
        message,
      },
    };

    // Add details if validation errors exist
    if (details && details.length > 0) {
      errorResponse.error.details = details;
    }

    // Log error for debugging (optional)
    console.error({
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json(errorResponse);
  }

  /**
   * Formats validation errors from class-validator
   */
  private formatValidationErrors(messages: any[]): any[] {
    return messages.map((msg) => {
      // If it's a ValidationError object from class-validator
      if (typeof msg === 'object' && msg.constraints) {
        return {
          field: msg.property,
          message: Object.values(msg.constraints).join(', '),
        };
      }

      // If it's already a string
      if (typeof msg === 'string') {
        return { message: msg };
      }

      // If it's a custom object
      return msg;
    });
  }

  /**
   * Maps HTTP status codes to error codes
   */
  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }
}
