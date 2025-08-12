import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class CoordinateDto {
  @ApiPropertyOptional({ required: false, default: 126.7984272688105 })
  @IsOptional()
  startX?: number;

  @ApiPropertyOptional({ required: false, default: 35.108469504775336 })
  @IsOptional()
  goalX?: number;

  @ApiPropertyOptional({ required: false, default: 126.78106478278926 })
  @IsOptional()
  startY?: number;

  @ApiPropertyOptional({ required: false, default: 35.172236406158696 })
  @IsOptional()
  goalY?: number;
}