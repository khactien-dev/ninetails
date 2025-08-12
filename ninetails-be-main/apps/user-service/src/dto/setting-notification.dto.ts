import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '../../../../libs/dtos/base.dto';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class SettingNotificationContent {
  @ApiProperty()
  id: number;

  @ApiProperty()
  start_operate: boolean;

  @ApiProperty()
  end_operate: boolean;

  @ApiProperty()
  to_trash_collection_point: boolean;

  @ApiProperty()
  to_landfill: boolean;

  @ApiProperty()
  complete_route: boolean;

  @ApiProperty()
  back_to_parking: boolean;

  @ApiProperty()
  start_other_operations: boolean;

  @ApiProperty()
  end_other_operations: boolean;

  @ApiProperty()
  start_standby_state: boolean;

  @ApiProperty()
  end_standby_state: boolean;

  @ApiProperty()
  lost_signal: boolean;

  @ApiProperty()
  reconnect_signal: boolean;
}

export class SettingNotificationRes extends BaseDto {
  @ApiProperty({ type: SettingNotificationContent })
  data: SettingNotificationContent;
}

export class UpdateSettingNotificationReq {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  start_operate: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  end_operate: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  to_trash_collection_point: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  to_landfill: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  complete_route: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  back_to_parking: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  start_other_operations: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  end_other_operations: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  start_standby_state: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  end_standby_state: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  lost_signal: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  reconnect_signal: boolean;
}
