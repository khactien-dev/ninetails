import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class ExportReqCommon {
  @ApiProperty()
  @IsIn(['csv', 'excel'])
  type: string;
}

export class ExportReqDto extends ExportReqCommon {
  @ApiProperty()
  @IsIn([
    'routes',
    'segments',
    'sections',
    'point',
    'congestion_codes',
    'core_sections',
    'guides',
    'guide_codes',
    'route_segment_map',
    'metadata',
  ])
  table: string;
}
