import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class EdgeInfo {
  @ApiProperty({ example: '2025-04-14T16:22:39' })
  @IsDate()
  date_time: Date;

  @ApiProperty({ example: 'GS0_E_003' })
  @IsOptional()
  edge_id: string;
  @ApiProperty({ example: 'Nvidia Orin Nano (16G)' })
  @IsOptional()
  hw_model: string;
  @ApiProperty({ example: 'Ubuntu 20.04.6 LTS' })
  @IsOptional()
  os_ver: string;
  @ApiProperty({ example: '5.10.104-tegra' })
  @IsOptional()
  kernel_ver: string;
  @ApiProperty({ example: '5.1.1.b56' })
  @IsOptional()
  jetpack_ver: string;
  @ApiProperty({ example: '20.10.7 build f0df350' })
  @IsOptional()
  docker_ver: string;
}

export class EdgeInfoReq {
  @ApiProperty({ example: 'GS0' })
  @IsNotEmpty()
  customer_id: string;
  @ApiProperty({ example: 'edge_info_REQ' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^edge_info_REQ$/)
  topic: 'edge_info_REQ';
  @ApiProperty({ type: EdgeInfo })
  data: EdgeInfo;
}
