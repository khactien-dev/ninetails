import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';
import { BasePagination, BaseQueryReq } from 'libs/dtos/base.req';
import { ComboBoxEntity } from 'libs/entities/combo-box.entity';
import { IsAfter, IsBefore } from 'libs/utils/validator.util';
import { ComboBoxContent } from '../dto/combo-box.dto';
import { VehicleData } from '../vehicle/vehicle.dto';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import { ESORT_EDGESERVER } from 'libs/enums/common.enum';

export class EdgeServeData {
  @ApiProperty()
  id: number;
  @ApiProperty()
  edge_name: string;
  @ApiProperty({ type: VehicleData })
  vehicle: VehicleData;
  @ApiProperty()
  password: string;
  @ApiProperty()
  mac_address: string;
  @ApiProperty()
  hw_version: string;
  @ApiProperty()
  os_version: string;
  @ApiProperty()
  kernel_version: string;
  @ApiProperty()
  jetpack_version: string;
  @ApiProperty()
  docker_version: string;
  @ApiProperty()
  edge_metrics: string;
  @ApiProperty()
  edge_metrics_checkbox: boolean;
  @ApiProperty()
  collection_metrics: string;
  @ApiProperty()
  collection_metrics_checkbox: boolean;
  @ApiProperty()
  operation_metrics: string;
  @ApiProperty()
  operation_metrics_checkbox: boolean;
  @ApiProperty()
  operation_status_ui: boolean;
  @ApiProperty()
  operation_status_ui_checkbox: boolean;
  @ApiProperty()
  collection_status_ui: boolean;
  @ApiProperty()
  collection_status_ui_checkbox: boolean;
  @ApiProperty()
  volume_analysis_ui: boolean;
  @ApiProperty()
  volume_analysis_ui_checkbox: boolean;
  @ApiProperty()
  quantity_analysis_ui: boolean;
  @ApiProperty()
  quantity_analysis_ui_checkbox: boolean;
  @ApiProperty()
  video_ui: boolean;
  @ApiProperty()
  video_ui_checkbox: boolean;
  @ApiProperty()
  edge_setting_version: string;
  @ApiProperty()
  status: boolean;
}

export class EdgeServeCreateForm {
  @ApiProperty({ required: true, default: 'GSE_001 - 92버9267' })
  @IsNotEmpty({ message: 'This field is required.' })
  @MaxLength(200)
  @IsString()
  edge_name: string;

  @ApiProperty({
    required: true,
    default: { id: 1, vehicle_number: '341가5678' },
  })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  vehicle: VehicleEntity;

  @ApiProperty({ required: true, default: 'password' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  password: string;

  @ApiProperty({ required: true, default: 'mac_address' })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  mac_address: string;

  @ApiProperty({ required: true, default: 'hw_version' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  hw_version: string;

  @ApiProperty({ required: true, default: 'os_version' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  os_version: string;

  @ApiProperty({ required: true, default: 'kernel_version' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  kernel_version: string;

  @ApiProperty({ required: true, default: 'jetpack_version' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  jetpack_version: string;

  @ApiProperty({ required: true, default: 'docker_version' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  docker_version: string;

  @ApiProperty({ required: true, default: 0 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsInt()
  edge_metrics: number;

  @ApiProperty({ required: true, default: false })
  @IsBoolean()
  edge_metrics_checkbox: boolean;

  @ApiProperty({ required: true, default: 0 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsInt()
  collection_metrics: number;

  @ApiProperty({ required: true, default: false })
  @IsBoolean()
  collection_metrics_checkbox: boolean;

  @ApiProperty({ required: true, default: 0 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsInt()
  operation_metrics: number;

  @ApiProperty({ required: true, default: false })
  @IsBoolean()
  operation_metrics_checkbox: boolean;

  @ApiProperty({ required: true, default: true })
  @IsBoolean()
  operation_status_ui: boolean;

  @ApiProperty({ required: true, default: false })
  @IsBoolean()
  operation_status_ui_checkbox: boolean;

  @ApiProperty({ required: true, default: true })
  @IsBoolean()
  collection_status_ui: boolean;

  @ApiProperty({ required: true, default: false })
  @IsBoolean()
  collection_status_ui_checkbox: boolean;

  @ApiProperty({ required: true, default: true })
  @IsBoolean()
  volume_analysis_ui: boolean;

  @ApiProperty({ required: true, default: false })
  @IsBoolean()
  volume_analysis_ui_checkbox: boolean;

  @ApiProperty({ required: true, default: true })
  @IsBoolean()
  quantity_analysis_ui: boolean;

  @ApiProperty({ required: true, default: false })
  @IsBoolean()
  quantity_analysis_ui_checkbox: boolean;

  @ApiProperty({ required: true, default: true })
  @IsBoolean()
  video_ui: boolean;

  @ApiProperty({ required: true, default: false })
  @IsBoolean()
  video_ui_checkbox: boolean;

  @ApiProperty({ required: true, default: 1.0 })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  edge_setting_version: number;

  @ApiProperty({ required: true, default: true })
  @IsBoolean()
  status: boolean;
}

export class EdgeServeUpdateForm {
  @ApiProperty({ required: true, default: 'GSE_001 - 92버9267' })
  @IsOptional()
  @MaxLength(200)
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  edge_name: string;

  @ApiProperty({
    required: true,
    default: { id: 1, vehicle_number: '341가5678' },
  })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  vehicle: VehicleEntity;

  @ApiProperty({ required: true, default: 'password' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  password: string;

  @ApiProperty({ required: true, default: 'mac_address' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  mac_address: string;

  @ApiProperty({ required: true, default: 'hw_version' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  hw_version: string;

  @ApiProperty({ required: true, default: 'os_version' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  os_version: string;

  @ApiProperty({ required: true, default: 'kernel_version' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  kernel_version: string;

  @ApiProperty({ required: true, default: 'jetpack_version' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  jetpack_version: string;

  @ApiProperty({ required: true, default: 'docker_version' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  docker_version: string;

  @ApiProperty({ required: true, default: 0 })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsInt()
  edge_metrics: number;

  @ApiProperty({ required: true, default: false })
  @IsOptional()
  @IsBoolean()
  edge_metrics_checkbox: boolean;

  @ApiProperty({ required: true, default: 0 })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsInt()
  collection_metrics: number;

  @ApiProperty({ required: true, default: false })
  @IsOptional()
  @IsBoolean()
  collection_metrics_checkbox: boolean;

  @ApiProperty({ required: true, default: 0 })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsInt()
  operation_metrics: number;

  @ApiProperty({ required: true, default: false })
  @IsOptional()
  @IsBoolean()
  operation_metrics_checkbox: boolean;

  @ApiProperty({ required: true, default: true })
  @IsOptional()
  @IsBoolean()
  operation_status_ui: boolean;

  @ApiProperty({ required: true, default: false })
  @IsOptional()
  @IsBoolean()
  operation_status_ui_checkbox: boolean;

  @ApiProperty({ required: true, default: true })
  @IsOptional()
  @IsBoolean()
  collection_status_ui: boolean;

  @ApiProperty({ required: true, default: false })
  @IsOptional()
  @IsBoolean()
  collection_status_ui_checkbox: boolean;

  @ApiProperty({ required: true, default: true })
  @IsOptional()
  @IsBoolean()
  volume_analysis_ui: boolean;

  @ApiProperty({ required: true, default: false })
  @IsOptional()
  @IsBoolean()
  volume_analysis_ui_checkbox: boolean;

  @ApiProperty({ required: true, default: true })
  @IsOptional()
  @IsBoolean()
  quantity_analysis_ui: boolean;

  @ApiProperty({ required: true, default: false })
  @IsOptional()
  @IsBoolean()
  quantity_analysis_ui_checkbox: boolean;

  @ApiProperty({ required: true, default: true })
  @IsOptional()
  @IsBoolean()
  video_ui: boolean;

  @ApiProperty({ required: true, default: false })
  @IsOptional()
  @IsBoolean()
  video_ui_checkbox: boolean;

  @ApiProperty({ required: true, default: 1.0 })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  edge_setting_version: number;

  @ApiProperty({ required: true, default: true })
  @IsOptional()
  @IsBoolean()
  status: boolean;
}

export class EdgeServeUpdateManyInput {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  status: boolean;
}

export class EdgeServeUpdateManyForm {
  @ApiProperty({ default: [1, 2] })
  @IsArray()
  @ArrayNotEmpty()
  ids: [];
  @ApiProperty()
  @IsObject()
  input: EdgeServeUpdateManyInput;
}

export class EdgeServeDeleteManyForm {
  @ApiProperty({ default: [1, 2] })
  @IsArray()
  @ArrayNotEmpty()
  ids: [];
}

export class EdgeServeListData {
  @ApiProperty({ type: [EdgeServeData] })
  data: [];
  @ApiProperty()
  pagination: BasePagination;
}

export class EdgeServeSaveRes extends BaseDto {
  @ApiProperty({ type: EdgeServeData })
  data: EdgeServeData;
}

export class EdgeServeDeleteRes extends BaseDto {
  @ApiProperty({ type: Boolean })
  data: boolean;
}

export class EdgeServeListRes extends BaseDto {
  @ApiProperty({ type: EdgeServeListData })
  data: EdgeServeListData;
}

export class EdgeServeUpdateManyRes extends BaseDto {
  @ApiProperty({ type: [EdgeServeData] })
  data: [];
}
export class EdgeServeDeleteManyRes extends BaseDto {
  @ApiProperty({ type: Number })
  data: number;
}

export class EdgeServeReq extends BaseQueryReq {
  @ApiProperty()
  @IsOptional()
  @IsEnum(ESORT_EDGESERVER)
  sortField?: ESORT_EDGESERVER;
}
