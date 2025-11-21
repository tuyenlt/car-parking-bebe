import { ApiProperty } from "@nestjs/swagger";

class ErrorResponseDto {
  @ApiProperty({
    example: "fieldName is invalid",
  })
  fieldName?: string;

  @ApiProperty({
    example: "Bad request",
  })
  message?: string;
}

export class BadRequestResponseDto {
  @ApiProperty({
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    example: [
      {
        fieldName: "fieldName 1",
        message: "Message for fieldName 1",
      },
    ],
  })
  errors: ErrorResponseDto[];
}

export class UnauthorizeResponseDto {
  @ApiProperty({
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    example: [
      {
        message: "Unauthorize",
      },
    ],
  })
  errors: ErrorResponseDto[];
}

export class ForbiddenResponseDto {
  @ApiProperty({
    example: 403,
  })
  statusCode: number;

  @ApiProperty({
    example: [
      {
        message: "Forbidden resource",
      },
    ],
  })
  errors: ErrorResponseDto[];
}

export class NotFoundResourceResponseDto {
  @ApiProperty({
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    example: [
      {
        message: "Resource not found",
      },
    ],
  })
  errors: ErrorResponseDto[];
}

export class ConflictResponseDto {
  @ApiProperty({
    example: 409,
  })
  statusCode: number;

  @ApiProperty({
    example: [
      {
        message: "Conflict error",
      },
    ],
  })
  errors: ErrorResponseDto[];
}

export class InternalErrorResponseDto {
  @ApiProperty({
    example: 500,
  })
  statusCode: number;

  @ApiProperty({
    example: [
      {
        message: "Internal error",
      },
    ],
  })
  errors: ErrorResponseDto[];
}
