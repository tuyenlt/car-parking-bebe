import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ORDER_DIRECTION } from "../constants/common.constant";

export class BasePaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  per_page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiProperty({ required: false, default: ORDER_DIRECTION.ASC })
  @IsOptional()
  @IsString()
  order_direction?: ORDER_DIRECTION;
}
