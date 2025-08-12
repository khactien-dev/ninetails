import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { BaseFilterDatasetDto } from './operation-analysis.dto';

export class DataSet {
  indexName: string;
  data: any;
  schema?: string;
}

export class Charaters {
  id: string;
  name: string;
  quote: string;
}

export class DeleteInput {
  indexName: string;
  id?: string;
}

export class searchCharacterByKeyword {
  indexName: string;
  keyword: string;
}

export class searchIndex {
  indexName: string;
}

export class SearchAndFilterListDto {
  @ApiPropertyOptional()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  dispatchNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  routeName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  updateTime?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  statisticMode?: string;
}

export class SearchForStatisticsDto {
  @ApiPropertyOptional()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  endDate?: string;
}

export class SearchOtherStatisticsDto extends SearchForStatisticsDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  routeNames?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  statisticMode?: string;
}

export class SearchVehicleForStatisticsDto extends SearchForStatisticsDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  routeName?: string;
}

export class DashFakeDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  start?: boolean;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  timestamp?: string;
}

export class CoreDataSetDto extends SearchForStatisticsDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  routeName?: string;

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

export class SearchDashboard {
  @ApiPropertyOptional()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate must be in the format yyyy-mm-dd',
  })
  startDate?: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate must be in the format yyyy-mm-dd',
  })
  endDate?: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDatePrev must be in the format yyyy-mm-dd',
  })
  startDatePrev?: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDatePrev must be in the format yyyy-mm-dd',
  })
  endDatePrev?: string;
}

export class CollectCountGraphDto extends BaseFilterDatasetDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  routeName?: string;

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

export class DrivingRouteGraphDto extends BaseFilterDatasetDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  routeName?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  cumulation?: number;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  excludeRoute?: string;
}

export class CustomGraphDto extends BaseFilterDatasetDto {
  routeName?: string;

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

export class CreateIndexName {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  schema: string;
}

export class calculatorDashboardForDay {
  @ApiPropertyOptional()
  @IsOptional()
  date?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  schema: string;
}

export class ZScoreDto extends BaseFilterDatasetDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  routeName?: string;
}

export class ToggleMessageDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  start?: boolean;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  routeId?: any;
  
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  sectionId?: any;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  segmentId?: any;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  sectionName?: any;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  customerId?: any;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  timestamp?: string;
}
