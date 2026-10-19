import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error } = this.resolveError(exception);

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolveError(exception: unknown): {
    statusCode: number;
    message: string | string[];
    error: string;
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        return { statusCode, message: res, error: exception.name };
      }

      const body = res as Record<string, unknown>;
      return {
        statusCode,
        message: (body.message as string | string[]) ?? exception.message,
        error: (body.error as string) ?? exception.name,
      };
    }

    if (exception instanceof QueryFailedError) {
      return this.mapQueryFailedError(exception);
    }

    this.logger.error(exception);
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private mapQueryFailedError(exception: QueryFailedError): {
    statusCode: number;
    message: string;
    error: string;
  } {
    const message = exception.message;

    if (message.includes('UNIQUE constraint failed')) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Resource already exists',
        error: 'Conflict',
      };
    }

    if (
      message.includes('NOT NULL constraint failed') ||
      message.includes('CHECK constraint failed')
    ) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid input',
        error: 'Bad Request',
      };
    }

    this.logger.error(exception);
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }
}
