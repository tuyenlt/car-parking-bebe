import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { LoggerService } from "../logger/logger.service";

interface IError {
  message: string;
  code_error: string;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request: any = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseData: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (
      exception instanceof HttpException &&
      exception.getResponse() &&
      Array.isArray((exception.getResponse() as any).errors)
    ) {
      const res = exception.getResponse() as any;
      responseData.errors = res.errors;
      responseData.code_error = res.code_error ?? null;
    } else {
      let errorMessage = "";
      if (exception instanceof HttpException) {
        const res = exception.getResponse() as any;
        errorMessage = typeof res === "string" ? res : res.message;
      } else {
        errorMessage = (exception as Error).message;
      }
      responseData.errors = [{ message: errorMessage }];
      responseData.code_error = null;
    }

    this.logMessage(request, responseData, status, exception);

    response.status(status).json(responseData);
  }

  private logMessage(
    request: any,
    message: IError,
    status: number,
    exception: any,
  ) {
    if (status === 500) {
      this.logger.error(
        `End Request for ${request.path}`,
        `method=${request.method} status=${status} code_error=${
          message.code_error ? message.code_error : null
        } message=${message.message ? message.message : null}`,
        status >= 500 ? exception.stack : "",
      );
    } else {
      this.logger.warn(
        `End Request for ${request.path}`,
        `method=${request.method} status=${status} code_error=${
          message.code_error ? message.code_error : null
        } message=${message.message ? message.message : null}`,
      );
    }
  }
}
