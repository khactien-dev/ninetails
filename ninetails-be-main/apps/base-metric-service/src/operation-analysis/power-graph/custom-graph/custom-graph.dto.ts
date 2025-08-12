import { ApiPropertyOptional } from "@nestjs/swagger";
import { BaseDto } from "../../../base-query/base.dto";
import { IsOptional } from "class-validator";

export class CustomGraphDto extends BaseDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  routeName1?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  routeName2?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  yAxises1?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  yAxises2?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  cumulation?: number;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  cumulation_y1?: number;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  cumulation_y2?: number;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  conditions1?: CustomConditionDto[];

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  conditions2?: CustomConditionDto[];

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  value?: number;
}

export class CustomConditionDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  logicalOperator?: 'AND' | 'OR';

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  domain?: string;
  condition?:
    | 'Equals'
    | 'Greater than'
    | 'Greater than or equals'
    | 'Less than'
    | 'Less than or equals'
    | 'Not equals';
  value?: number;
}