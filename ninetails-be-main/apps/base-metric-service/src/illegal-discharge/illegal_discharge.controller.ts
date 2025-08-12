import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { IllegalDischargeService } from './illegal_discharge.service';
import { responseHelper } from 'libs/utils/helper.util';
import {
  AddressInput,
  IllegalDischargeSearchInput,
  IllegalDischargeSearchRes,
} from './illegal_discharge.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Metric')
@Controller()
export class IllegalDischargeController {
  constructor(private readonly service: IllegalDischargeService) {}

  @Get('illegal-discharge/search')
  @ApiBearerAuth()
  @ApiOkResponse({ type: IllegalDischargeSearchRes })
  async index(
    @Query() input: IllegalDischargeSearchInput,
    @Request() req: { auth: { tenant: string } },
    @Headers() header,
  ) {
    const schema = header['schema'] ? header['schema'] : req.auth.tenant;
    const data = await this.service.search(schema, input);

    return responseHelper(data);
  }

  @Get('illegal-discharge/search/dummy')
  @ApiOkResponse({ type: IllegalDischargeSearchRes })
  async searchDummy(@Query() input: IllegalDischargeSearchInput) {
    const data = await this.service.searchDummy();

    return responseHelper(data);
  }

  @Post('illegal-discharge/address')
  @ApiOkResponse()
  async searchAddress(@Body() input: AddressInput) {
    console.log(input);
    const data = await this.service.searchAddress(input.gps_x, input.gps_y);
    return responseHelper(data);
  }
}
