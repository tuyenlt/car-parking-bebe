import { ApiProperty } from "@nestjs/swagger";

export class BasePaginationResponseDto {
  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}
