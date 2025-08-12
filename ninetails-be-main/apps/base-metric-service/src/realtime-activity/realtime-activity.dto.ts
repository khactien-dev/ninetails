import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class RealtimeActivityDto {
    @ApiPropertyOptional()
    @IsOptional()
    date?: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    vehicleNumber?: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    routeName?: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    updateTime?: string;
  }