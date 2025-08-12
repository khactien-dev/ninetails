import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ELOGICAL,
  EOPERATOR,
  NUMBER_PAGE,
  SORTBY,
} from '../common/constants/common.constant';
import { SORTASSTAFF } from 'libs/enums/common.enum';

export class BaseQueryReq {
  @ApiProperty({ required: false })
  @Transform((params) =>
    params.value === '' ? NUMBER_PAGE.PAGE : +params.value,
  )
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false })
  @Transform((params) =>
    params.value === '' ? NUMBER_PAGE.PAGE_SIZE : +params.value,
  )
  @IsOptional()
  pageSize?: number = 10;

  @ApiProperty({ required: false, enum: SORTBY })
  @IsOptional()
  @IsEnum(SORTBY)
  sortBy?: SORTBY = SORTBY.desc;

  @ApiProperty({ required: false, enum: SORTASSTAFF })
  @IsEnum(SORTASSTAFF)
  @IsOptional()
  sortField?: string;
}

export class BasePagination {
  @ApiProperty()
  total: number;
  @ApiProperty()
  current_page: number;
  @ApiProperty()
  per_page: number;
  @ApiProperty()
  last_page: number;
}

export class RouteManageQuery {
  @ApiProperty({ required: false, enum: EOPERATOR })
  @IsOptional()
  @IsEnum(EOPERATOR)
  operator?: EOPERATOR;

  @ApiProperty({ required: false })
  @IsOptional()
  value: string;

  @ApiProperty({ required: false })
  @IsOptional()
  column: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ELOGICAL)
  logical: ELOGICAL;
}
