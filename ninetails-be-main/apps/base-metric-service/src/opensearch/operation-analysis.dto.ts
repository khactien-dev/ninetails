import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class BaseFilterDatasetDto {
    @ApiPropertyOptional()
    @IsOptional()
    startDate?: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    endDate?: string;
  }