import { IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class EdgeSettingDataDtoReq {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'GS0_E_003' })
  edge_id: string;
}

class EdgeSettingDataDtoRes {
  // @ApiProperty({ example: '1.004' })
  // version: string;
  @ApiProperty({ example: 5 })
  drive_metrics_interval: number;
  @ApiProperty({ example: 5 })
  collect_metrics_interval: number;
  @ApiProperty({ example: 30 })
  edge_state_interval: number;
  @ApiProperty({ example: 'no' })
  drive_stat_ui: string;
  @ApiProperty({ example: 'yes' })
  collect_stat_ui: string;
  @ApiProperty({ example: 'yes' })
  count_stat_ui: string;
  @ApiProperty({ example: 'yes' })
  volume_stat_ui: string;
  @ApiProperty({ example: 'yes' })
  video_ui: string;

  @ApiProperty()
  avg_weight: any;
}

export class EdgeSettingDtoReq {
  @ApiProperty({ example: 'GS0' })
  @IsNotEmpty()
  @IsString()
  customer_id: string;
  @ApiProperty({ example: 'edge_setting_REQ' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^edge_setting_REQ$/)
  topic: 'edge_setting_REQ';

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '1.002' })
  version: string;

  @ValidateNested({ each: true })
  @Type(() => EdgeSettingDataDtoReq)
  @ApiProperty()
  data: EdgeSettingDataDtoReq;
}

export class EdgeSettingDtoRes {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'GS0' })
  customer_id: string;
  @ApiProperty({ example: 'edge_setting_RES' })
  @IsNotEmpty()
  @Matches(/^edge_setting_RES$/)
  topic: 'edge_setting_RES';
  @ApiProperty()
  data: {
    system_setting: EdgeSettingDataDtoRes | { message: string };
  };

  @ApiProperty()
  version: number;

  @ApiProperty()
  status: string;
}
