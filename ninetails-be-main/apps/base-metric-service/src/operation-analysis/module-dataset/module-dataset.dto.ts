import { ApiPropertyOptional } from "@nestjs/swagger";
import { CoreDataSetDto } from "../core-dataset/core-dataset.dto";
import { IsOptional } from "class-validator";

export class ModuleDatasetDto extends CoreDataSetDto {
    @ApiPropertyOptional({ required: false })
    @IsOptional()
    conditions?: L2ExtensionDto[];
  }
  
  export class L2ExtensionDto {
    @ApiPropertyOptional({ required: false })
    @IsOptional()
    logicalOperator?: 'AND' | 'OR';
  
    @ApiPropertyOptional({ required: false })
    @IsOptional()
    L2Extension?: string;
    L3Extension?: L3ExtensionDto;
  }
  
  export class L3ExtensionDto {
    @ApiPropertyOptional({ required: false })
    @IsOptional()
    L3Extension?: string;
  
    @ApiPropertyOptional({ required: false })
    @IsOptional()
    column?: 'Maximum' | 'Average' | 'Minimum' | 'Raw value';
    condition?:
      | 'Equals'
      | 'Greater than'
      | 'Greater than or equals'
      | 'Less than'
      | 'Less than or equals'
      | 'Not equals';
    value?: number;
  }