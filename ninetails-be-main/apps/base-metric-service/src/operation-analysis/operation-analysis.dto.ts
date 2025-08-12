import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { BaseDto } from "../base-query/base.dto";

export class OperationAnalysisDto extends BaseDto {
    @ApiPropertyOptional()
    @IsOptional()
    updateTime?: string;
}