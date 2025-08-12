import { ApiProperty } from '@nestjs/swagger';
import {IsIn, IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';

export class FakeSendReq {
  @ApiProperty({ example: 'gs018' })
  @IsString()
  @IsNotEmpty()
  schema: string;

  @ApiProperty({ example: 'Segment 1' })
  @IsString()
  @IsNotEmpty()
  segment_name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  segment_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  route_id: number;

  @ApiProperty({ example: '태평 사거리 구간' })
  @IsString()
  @IsNotEmpty()
  section_name: string;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsIn([0,1,2,3,4,5,6])
  drive_mode: number;
}

export class FakeSendRes extends BaseDto {
  @ApiProperty({ type: Boolean })
  data: boolean;
}

export class PushReq {
  @ApiProperty({ example: 'STRING' })
  @IsString()
  @IsNotEmpty()
  schema: string;

  @ApiProperty({ example: 'start_operate' })
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'start_operate',
    'end_operate',
    'to_trash_collection_point',
    'to_landfill',
    'complete_route',
    'back_to_parking',
    'start_other_operations',
    'end_other_operations',
    'start_standby_state',
    'end_standby_state',
    'lost_signal',
    'reconnect_signal',
  ])
  type: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  route_id: number;
}

export class PushRes extends BaseDto {
  @ApiProperty({ type: Boolean })
  data: boolean;
}
