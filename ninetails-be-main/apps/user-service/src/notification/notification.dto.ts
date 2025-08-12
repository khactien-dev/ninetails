import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'libs/dtos/base.dto';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BasePagination } from 'libs/dtos/base.req';

export class NotificationContent {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  route_name: string;

  @ApiProperty()
  vehicle_number: string;

  @ApiProperty()
  read_at: Date;
}

export class ListNotificationData {
  @ApiProperty({ type: [NotificationContent] })
  data: [NotificationContent];
  @ApiProperty()
  pagination: BasePagination;
  @ApiProperty()
  count_unread: number;
}

export class DetailNotificationRes extends BaseDto {
  @ApiProperty({ type: NotificationContent })
  data: NotificationContent;
}

export class ListNotificationRes extends BaseDto {
  @ApiProperty({ type: ListNotificationData })
  data: ListNotificationData;
}

export class DeleteNotificationRes extends BaseDto {
  @ApiProperty({ type: Boolean })
  data: boolean;
}

export class MarkReadAllNotificationRes extends BaseDto {
  @ApiProperty({ type: Number })
  data: Number;
}
