import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EdgeStateService } from './edge-state.service';
import { EdgeStateQueryDto, EdgeStateResDto, LastEdgeStateQueryDto } from './dto/edge-state.dto';
import {
  responseHelper,
  setDefaultQuerySearchValues,
} from 'libs/utils/helper.util';
import { EdgeStateRawEntity } from 'libs/entities/edge-state.entity';
import * as moment from 'moment';

@ApiTags('Edge State')
@Controller('edge-state')
@ApiBearerAuth()
export class EdgeStateController {
  constructor(private edgeStateService: EdgeStateService) {}

  @Get('list')
  async listEdgeState(@Query() query: EdgeStateQueryDto) {
    const params = setDefaultQuerySearchValues(query) as EdgeStateQueryDto;
    let data: EdgeStateRawEntity[];
    let total: number;
    if (params.timeRange === '5m') {
      const result = await this.edgeStateService.getEdgeStateRaw(params);
      data = result.result;
      total = result.total;
    }
    if (params.timeRange === '30m') {
      params.date = moment().startOf('day').toDate();
      const result = await this.edgeStateService.getEdgeState30Min(params);
      data = result.result;
      total = result.total;
    }
    if (params.timeRange === '1h') {
      const result = await this.edgeStateService.getEdgeState1Hour(params);
      data = result.result;
      total = result.total;
    }
    if (params.timeRange === '1d') {
      const result = await this.edgeStateService.getEdgeState1Day(params);
      data = result.result;
      total = result.total;
    }
    return responseHelper({
      data,
      pagination: {
        total,
        last_page: Math.ceil(total / +query.pageSize),
        per_page: query.pageSize,
        current_page: query.page,
      },
    });
  }

  @Get('last-edge-state')
  @ApiOperation({ summary: 'Get Last Edge Stage' })
  @ApiOkResponse({ type: EdgeStateResDto })
  async edgeStateInfo(@Query() query: LastEdgeStateQueryDto) {
    const edgeState = await this.edgeStateService.getLastEdgeState(query);
    return responseHelper(edgeState);
  }
}
