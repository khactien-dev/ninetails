import { IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AuthEdgeManagementDataReq {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'GS0_E_003' })
  edge_id: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'uN#2bQ7&t!VzDp$h' })
  password: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '00-1A-2B-5C-9E-4D' })
  mac_address: string;
}

export class AuthEdgeManagementDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'GS0' })
  customer_id: string;
  @ApiProperty({ example: 'edge_login_REQ' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^edge_login_REQ$/)
  topic: 'edge_login_REQ';
  @ValidateNested({ each: true })
  @Type(() => AuthEdgeManagementDataReq)
  @ApiProperty()
  data: AuthEdgeManagementDataReq;
}

class AuthEdgeManagementDataRes {
  @ApiProperty()
  edge_id?: string;
  @ApiProperty()
  vehicle_id?: string;

  @ApiProperty()
  message?: string;
}

export class AuthEdgeManagementDtoRes {
  @ApiProperty()
  customer_id: string;
  @ApiProperty({ example: 'edge_login_RES' })
  @IsNotEmpty()
  @Matches(/^edge_login_RES$/)
  topic: 'edge_login_RES';
  @ApiProperty({ type: AuthEdgeManagementDataRes })
  data: AuthEdgeManagementDataRes;

  @ApiProperty()
  status?: string;
}
