import { ApiPropertyOptional } from "@nestjs/swagger";
import { BaseDto } from "../../../base-query/base.dto";
import { IsOptional } from "class-validator";

export class DrivingRouteGraphDto extends BaseDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  cumulation?: number;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  excludeRoute?: string;
}