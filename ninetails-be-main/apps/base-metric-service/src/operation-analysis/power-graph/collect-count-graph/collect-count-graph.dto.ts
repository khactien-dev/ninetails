import { ApiPropertyOptional } from "@nestjs/swagger";
import { BaseDto } from "../../../base-query/base.dto";
import { IsOptional } from "class-validator";

export class CollectCountGraphDto extends BaseDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  sectionName?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  cumulation?: number;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  aggregation?: boolean;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  L3Extension?: boolean;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  L4Extension?: boolean;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  trashBagType?: string;
}