import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class MetricWeightDto {
    @ApiPropertyOptional()
    @IsOptional()
    distanceRatioRate?: number;

    @ApiPropertyOptional()
    @IsOptional()
    durationRatioRate?: number;
    
    @ApiPropertyOptional()
    @IsOptional()
    collectDistanceRate?: number;
    
    @ApiPropertyOptional()
    @IsOptional()
    collectDurationRate?: number;
    
    @ApiPropertyOptional()
    @IsOptional()
    collectCountRate?: number;
    
    @ApiPropertyOptional()
    @IsOptional()
    manualCollectTimeRate?: number;
    
    @ApiPropertyOptional()
    @IsOptional()
    alpha?: number;
    
    @ApiPropertyOptional()
    @IsOptional()
    pValue?: number;
    
    @ApiPropertyOptional()
    @IsOptional()
    percentageAE?: number;
    
    @ApiPropertyOptional()
    @IsOptional()
    percentageBD?: number;
    
    @ApiPropertyOptional()
    @IsOptional()
    percentageC?: number;
}
