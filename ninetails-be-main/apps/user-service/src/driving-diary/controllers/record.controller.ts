import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { handlePaginate, responseHelper } from 'libs/utils/helper.util';
import {
  DrivingRecordQuery,
  DrivingRecordRes,
  DrivingRecordSaveDto,
} from '../dtos/driving-record.dto';
import { RecordService } from '../services/record.service';
import {
  LandfillCreateDto,
  LandfillQueryDto,
  LandfillRes,
} from '../dtos/landfill.dto';

@Controller('driving-record')
@ApiTags('Driving Record')
@ApiBearerAuth()
export class RecordController {
  constructor(private recordService: RecordService) {}

  @Post('drive/save')
  @ApiOperation({ summary: 'Save Driving Record' })
  @ApiCreatedResponse({ type: DrivingRecordRes })
  async saveDrive(@Body() body: DrivingRecordSaveDto) {
    return responseHelper(await this.recordService.saveDriving(body));
  }

  @Post('drive/get')
  @ApiOperation({ summary: 'Get Driving Record' })
  @ApiOkResponse({ type: DrivingRecordRes })
  async getDrive(@Body() body: DrivingRecordQuery) {
    return responseHelper(
      await this.recordService.findOneDrivingRecord(body.vehicle_id, body.date),
    );
  }

  @Post('landfill/create')
  @ApiOperation({ summary: 'Save Landfill Record' })
  @ApiCreatedResponse({ type: LandfillRes })
  async createLandfill(@Body() body: LandfillCreateDto) {
    return responseHelper(await this.recordService.createLandfill(body));
  }

  @Get('landfill/get')
  @ApiOperation({ summary: 'Get Landfill Record' })
  @ApiOkResponse({ type: LandfillRes })
  async getLandfill(@Query() query: LandfillQueryDto) {
    const handlePage = handlePaginate(query);
    return responseHelper(
      await this.recordService.findAndCountLandfill(query.date, handlePage),
    );
  }

  @Put('landfill/update/:id')
  @ApiOperation({ summary: 'Update Landfill Record' })
  @ApiOkResponse({ type: LandfillRes })
  async updateLandfill(
    @Param('id') id: number,
    @Body() body: LandfillCreateDto,
  ) {
    return responseHelper(await this.recordService.updateLandfill(id, body));
  }
}
