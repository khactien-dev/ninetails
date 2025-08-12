import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class BaseDto {
    @ApiPropertyOptional()
    @IsOptional()
    startDate?: string;
    
    @ApiPropertyOptional()
    @IsOptional()
    endDate?: string;
    
    @ApiPropertyOptional({ required: false })
    @IsOptional()
    routeNames?: any;
}