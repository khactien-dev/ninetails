import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { BaseDto } from "../../base-query/base.dto";

export class CoreDataSetDto extends BaseDto {
    @ApiPropertyOptional({ required: false, default: 0.15 })
    @IsOptional()
    distanceRatioRate?: number = 0.15;
  
    @ApiPropertyOptional({ required: false, default: 0.15 })
    @IsOptional()
    durationRatioRate?: number = 0.15;
  
    @ApiPropertyOptional({ required: false, default: 0.15 })
    @IsOptional()
    collectDistanceRate?: number = 0.15;
  
    @ApiPropertyOptional({ required: false, default: 0.15 })
    @IsOptional()
    collectDurationRate?: number = 0.15;
  
    @ApiPropertyOptional({ required: false, default: 0.3 })
    @IsOptional()
    collectCountRate?: number = 0.3;
  
    @ApiPropertyOptional({ required: false, default: 0.1 })
    @IsOptional()
    manualCollectTimeRate?: number = 0.1;
  
    @ApiPropertyOptional({ required: false, default: 0.1 })
    @IsOptional()
    alpha?: number = 0.1;
  
    @ApiPropertyOptional({ required: false, default: 0.05 })
    @IsOptional()
    pValue?: number = 0.05;
  
    @ApiPropertyOptional({ required: false, default: 0.1 })
    @IsOptional()
    percentageAE?: number = 0.1;
  
    @ApiPropertyOptional({ required: false, default: 0.2 })
    @IsOptional()
    percentageBD?: number = 0.2;
  
    @ApiPropertyOptional({ required: false, default: 0.4 })
    @IsOptional()
    percentageC?: number = 0.4;
}