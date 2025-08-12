import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BaseData {
  @ApiProperty({ required: true, default: 'schema' })
  @IsString()
  @IsNotEmpty()
  'customer_id': string;

  @ApiProperty({ required: true, default: '' })
  @IsString()
  @IsOptional()
  @IsIn([
    'drive_metrics',
    'vehicle_route',
    'vehicle_info',
    'edge_state_metrics',
    'collect_metrics',
    'illegal_discharges',
    'zscore_rollup',
  ])
  'topic': string;

  exchange?: string;
}

export class DriveMetricData {
  @ApiProperty({ required: true, default: '2024-09-25T02:51:38.705Z' })
  @IsDateString({ strict: true })
  @IsNotEmpty()
  'timestamp': Date;

  @ApiProperty({ required: true, default: 7 })
  @IsNumber()
  @IsNotEmpty()
  'drive_mode': number;

  @ApiProperty({ required: true, default: '341가5678' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  'vehicle_id': string;

  @ApiProperty({ required: true, default: 'Section 11' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  'section_name': string;

  @ApiProperty({ required: true, default: '011-강남구' })
  @IsOptional()
  @IsNotEmpty()
  'route_name': string;

  @ApiProperty({ required: true, default: [127.407295, 35.1739996] })
  @IsArray()
  @IsOptional()
  'location': number[];

  @ApiProperty({ required: true, default: 220 })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  'angle': number;

  @ApiProperty({ required: true, default: 10 })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  'eco_score': number;

  @ApiProperty({ required: true, default: '02:34:15' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  'trip_time': string;

  @ApiProperty({ required: true, default: 22.5 })
  @IsNumber()
  @IsNotEmpty()
  'distance': number;

  @ApiProperty({ required: true, default: 22.5 })
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  'trip_distance': number;

  @ApiProperty({ required: true, default: 57.4 })
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  'velocity': number;

  @ApiProperty({ required: true, default: 50 })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  'speeding': number;

  @ApiProperty({ required: true, default: 1 })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  'sudden_accel': number;

  @ApiProperty({ required: true, default: 0 })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  'sudden_break': number;

  @ApiProperty({ required: true, default: 1 })
  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  segment_id: number;

  @ApiProperty({ required: true, default: 1 })
  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  section_id: number;

  @ApiProperty({ required: true, default: 1 })
  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  route_id: number;
}

export class VehicleInfoData {
  @ApiProperty({ required: true, default: '2024-05-31T06:53:00' })
  @IsDateString({ strict: true })
  @IsNotEmpty()
  'timestamp': Date;

  @ApiProperty({ required: true, default: '341가5678' })
  @IsString()
  @IsNotEmpty()
  'vehicle_id': string;

  @ApiProperty({ required: true, default: '압착진개차_5T' })
  @IsString()
  @IsNotEmpty()
  'type': string;

  @ApiProperty({ required: true, default: '5톤 덤프식' })
  @IsString()
  @IsNotEmpty()
  'model': string;

  @ApiProperty({ required: true, default: '에이엠특장' })
  @IsString()
  @IsNotEmpty()
  'vendor': string;

  @ApiProperty({ required: true, default: 11 })
  @IsNumber()
  @IsNotEmpty()
  'capacity_m3': number;

  @ApiProperty({ required: true, default: 5600 })
  @IsNumber()
  @IsNotEmpty()
  'capacity_kg': number;

  @ApiProperty({ required: true, default: '2024-05-31T06:53:00' })
  @IsDateString({ strict: true })
  @IsNotEmpty()
  'operation_start': Date;

  @ApiProperty({ required: true, default: '2024-05-31T06:53:00' })
  @IsDateString({ strict: true })
  @IsNotEmpty()
  'operation_end': Date;

  @ApiProperty({ required: true, default: '첨단 1,2' })
  @IsString()
  @IsNotEmpty()
  'dispatch_status': string;

  @ApiProperty({ required: true, default: '2024-05-30' })
  @IsDateString()
  @IsNotEmpty()
  'last_maintenance': Date;

  @ApiProperty({ required: true, default: '2024-08-30' })
  @IsDateString()
  @IsNotEmpty()
  'next_maintenance': Date;

  @ApiProperty({ required: true, default: '생활' })
  @IsString()
  @IsNotEmpty()
  'usage': string;

  @ApiProperty({ required: true, default: '적정량 준수 준수' })
  @IsString()
  @IsNotEmpty()
  'note': string;
}

export class VehicleRouteData {
  @ApiProperty({ required: true, default: '2024-05-31T06:53:00' })
  @IsDateString({ strict: true })
  @IsNotEmpty()
  'timestamp': Date;

  @ApiProperty({ required: true, default: '20240531-S018' })
  @IsString()
  @IsNotEmpty()
  'dispatch_no': string;

  @ApiProperty({ required: true, default: ['128.12345,37.98776'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty()
  'coordinates': string[];
}

export class CollectMetricData {
  @ApiProperty({ required: true, default: '2024-05-31T06:53:00' })
  @IsDateString({ strict: true })
  @IsNotEmpty()
  'timestamp': Date;

  @ApiProperty({ required: true, default: '20240531-S003' })
  @IsString()
  @IsNotEmpty()
  'dispatch_no': string;

  @ApiProperty({ required: true, default: 5 })
  @IsNumber()
  @IsNotEmpty()
  'drive_mode': number;

  @ApiProperty({ required: true, default: 'Section 11' })
  @IsString()
  @IsNotEmpty()
  'section_name': string;

  @ApiProperty({ required: true, default: 1 })
  @IsInt()
  @IsNotEmpty()
  'segment_id': number;

  @ApiProperty({ required: true, default: 1 })
  @IsInt()
  @IsNotEmpty()
  'route_id': number;

  @ApiProperty({ required: true, default: [127.407295, 35.1739996] })
  @IsArray()
  @IsOptional()
  'location': number[];

  @ApiProperty({ required: true, default: [2, 2, 2] })
  @IsArray()
  @IsNotEmpty()
  '5L_gen': number[];

  @ApiProperty({ required: true, default: [4, 4, 4] })
  @IsArray()
  @IsNotEmpty()
  '10L_gen': number[];

  @ApiProperty({ required: true, default: [1, 1, 1] })
  @IsArray()
  @IsNotEmpty()
  '10L_reu': number[];

  @ApiProperty({ required: true, default: [10, 10, 10] })
  @IsArray()
  @IsNotEmpty()
  '20L_gen': number[];

  @ApiProperty({ required: true, default: [8, 8, 8] })
  @IsArray()
  @IsNotEmpty()
  '20L_reu': number[];

  @ApiProperty({ required: true, default: [12, 12, 12] })
  @IsArray()
  @IsNotEmpty()
  '30L_gen': number[];

  @ApiProperty({ required: true, default: [3, 3, 3] })
  @IsArray()
  @IsNotEmpty()
  '50L_gen': number[];

  @ApiProperty({ required: true, default: [2, 2, 2] })
  @IsArray()
  @IsNotEmpty()
  '50L_pub': number[];

  @ApiProperty({ required: true, default: [5, 5, 5] })
  @IsArray()
  @IsNotEmpty()
  '75L_gen': number[];

  @ApiProperty({ required: true, default: [1, 1, 1] })
  @IsArray()
  @IsNotEmpty()
  '75L_pub': number[];

  @ApiProperty({ required: true, default: [1, 1, 1] })
  @IsArray()
  @IsNotEmpty()
  'ext': number[];

  @ApiProperty({ required: true, default: [1, 2, 3] })
  @IsArray()
  @IsNotEmpty()
  'etc': number[];
}

export class IllegalDischargeData {
  @ApiProperty({ required: true, default: 1 })
  @IsNumber()
  @IsNotEmpty()
  'id': number;

  @ApiProperty({ required: true, default: '011-강남구' })
  @IsString()
  @IsNotEmpty()
  'route_name': string;

  @ApiProperty({ required: true, default: '2024-05-31T06:53:00' })
  @IsDateString({ strict: true })
  @IsNotEmpty()
  'produce': Date;

  @ApiProperty({ required: true, default: '2024-05-31T06:53:00' })
  @IsDateString({ strict: true })
  @IsOptional()
  'collection': Date;

  @ApiProperty({ required: false, default: 5, readOnly: true })
  @IsNumber()
  @IsOptional()
  'hour': number;

  @ApiProperty({ required: true, default: 1 })
  @IsNumber()
  @IsNotEmpty()
  @IsIn([1, 2, 3, 4])
  'classification': number;

  @ApiProperty({ required: false, default: '운남3길 78-2', readOnly: true })
  @IsString()
  @IsOptional()
  'address': string;

  @ApiProperty({ required: true, default: 127.407295 })
  @IsNumber()
  @IsLongitude()
  @IsNotEmpty()
  'gps_x': number;

  @ApiProperty({ required: true, default: 36.423565 })
  @IsNumber()
  @IsLatitude()
  @IsNotEmpty()
  'gps_y': number;
}

class EdgeStateTemperature {
  @ApiProperty({ required: true, default: 52.3 })
  cpu_avg_degree: number;

  @ApiProperty({ required: true, default: 54.68 })
  gpu_avg_degree: number;

  @ApiProperty({ required: true, default: 47.25 })
  soc_avg_degree: number;
}

class EdgeStateUtilization {
  @ApiProperty({ required: true, default: 52.3 })
  'cpu_avg_%': number;

  @ApiProperty({ required: true, default: 54.68 })
  'gpu_avg_%': number;

  @ApiProperty({ required: true, default: 68.0 })
  'mem_avg_%': number;

  @ApiProperty({ required: true, default: 51.0 })
  'disk_avg_%': number;
}

class EdgeStateDataIo {
  @ApiProperty({ required: true, default: 282000 })
  lte_in_total_byte: number;

  @ApiProperty({ required: true, default: 1984000 })
  lte_out_total_byte: number;

  @ApiProperty({ required: true, default: 145400000 })
  camera_total_byte: number;

  @ApiProperty({ required: true, default: 2064000 })
  dtg_total_byte: number;

  @ApiProperty({ required: true, default: 168800000 })
  disk_total_byte: number;
}

export class EdgeStateData {
  // @ApiProperty({ required: true, default: '2024-05-31T06:53:00' })
  // @IsDateString({ strict: true })
  // @IsNotEmpty()
  'timestamp': Date;

  @ApiProperty({ required: true, default: 1 })
  @IsInt()
  'route_id': number;

  @ApiProperty({ required: true, type: EdgeStateTemperature })
  @IsOptional()
  temperature: EdgeStateTemperature;

  @ApiProperty({ required: true, type: EdgeStateUtilization })
  @IsOptional()
  utilization: EdgeStateUtilization;

  @ApiProperty({ required: true, type: EdgeStateDataIo })
  @IsOptional()
  data_io: EdgeStateDataIo;
}

export class DistanceCollectData {
  @ApiProperty({ required: true, default: 1 })
  @IsNumber()
  @IsNotEmpty()
  distanceRatios: number;

  @ApiProperty({ required: true, default: 1 })
  @IsNumber()
  @IsNotEmpty()
  durationRatios: number;

  @ApiProperty({ required: true, default: 1 })
  @IsNumber()
  @IsNotEmpty()
  collectDistance: number;

  @ApiProperty({ required: true, default: 1 })
  @IsNumber()
  @IsNotEmpty()
  collectDuration: number;

  @ApiProperty({ required: true, default: 1 })
  @IsNumber()
  @IsNotEmpty()
  collectCount: number;
}

export class ZscoreRollupData {
  @ApiProperty({ required: true, default: '2024-05-31T06:53:00' })
  @IsDateString({ strict: true })
  @IsNotEmpty()
  'timestamp': Date;

  @ApiProperty({ required: true, default: '341가5678' })
  @IsString()
  @IsNotEmpty()
  'vehicle_id': string;

  @ApiProperty({ required: true, default: '011-강남구' })
  @IsString()
  @IsNotEmpty()
  'route_name': string;

  @ApiProperty({ required: true, default: 'rankScore' })
  @IsString()
  @IsNotEmpty()
  'rankScore': string;

  @ApiProperty({ required: true, type: DistanceCollectData })
  @IsObject()
  @ValidateNested()
  @Type(() => DistanceCollectData)
  @IsNotEmpty()
  'latest': DistanceCollectData;

  @ApiProperty({ required: true, type: DistanceCollectData })
  @IsObject()
  @ValidateNested()
  @Type(() => DistanceCollectData)
  @IsNotEmpty()
  'mean': DistanceCollectData;

  @ApiProperty({ required: true, type: DistanceCollectData })
  @IsObject()
  @ValidateNested()
  @Type(() => DistanceCollectData)
  @IsNotEmpty()
  'standardDeviation': DistanceCollectData;
}

export class CreateDriveMetricData extends BaseData {
  @ApiProperty({ required: true, type: DriveMetricData })
  @IsObject()
  @ValidateNested()
  @Type(() => DriveMetricData)
  @IsNotEmpty()
  'data': DriveMetricData;
}

export class CreateVehicleInfoData extends BaseData {
  @ApiProperty({ required: true, type: VehicleInfoData })
  @IsObject()
  @ValidateNested()
  @Type(() => VehicleInfoData)
  @IsNotEmpty()
  'data': VehicleInfoData;
}

export class CreateVehicleRouteData extends BaseData {
  @ApiProperty({ required: true, type: VehicleRouteData })
  @IsObject()
  @ValidateNested()
  @Type(() => VehicleRouteData)
  @IsNotEmpty()
  'data': VehicleRouteData;
}

export class CreateCollectMetricData extends BaseData {
  @ApiProperty({ required: true, type: CollectMetricData })
  @IsObject()
  @ValidateNested()
  @Type(() => CollectMetricData)
  @IsNotEmpty()
  'data': CollectMetricData;
}

export class CreateDriveMetricData5 extends BaseData {
  @ApiProperty({ required: true, type: DriveMetricData })
  @IsObject()
  @ValidateNested()
  @Type(() => DriveMetricData)
  @IsNotEmpty()
  'data': DriveMetricData;

  @ApiProperty({ required: true, type: CollectMetricData })
  @IsObject()
  @ValidateNested()
  @Type(() => CollectMetricData)
  @IsNotEmpty()
  'collect': CollectMetricData;
}

export class CreateIllegalDischargeData extends BaseData {
  @ApiProperty({ required: true, type: IllegalDischargeData })
  @IsObject()
  @ValidateNested()
  @Type(() => IllegalDischargeData)
  @IsNotEmpty()
  'data': IllegalDischargeData;
}

export class CreateEdgeStateData extends BaseData {
  @ApiProperty({ required: true, type: EdgeStateData })
  @IsObject()
  @ValidateNested()
  @Type(() => EdgeStateData)
  @IsNotEmpty()
  'data': EdgeStateData;
}

export class CreateZscoreRollupData extends BaseData {
  @ApiProperty({ required: true, type: ZscoreRollupData })
  @IsObject()
  @ValidateNested()
  @Type(() => ZscoreRollupData)
  @IsNotEmpty()
  'data': ZscoreRollupData;
}
