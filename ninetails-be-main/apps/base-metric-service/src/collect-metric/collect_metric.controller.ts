import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CollectMetricService } from './collect_metric.service';
import { responseHelper } from 'libs/utils/helper.util';
import {
  CollectMetricSearchInput,
  CollectMetricSearchRes,
} from './collect_metric.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Metric')
@Controller()
export class CollectMetricController {
  constructor(private readonly service: CollectMetricService) {}

  @Post('collect-metric/search')
  @ApiOkResponse({ type: CollectMetricSearchRes })
  async index(@Body() input: CollectMetricSearchInput) {
    const data = await this.service.search(input);

    return responseHelper(data);
  }
}
