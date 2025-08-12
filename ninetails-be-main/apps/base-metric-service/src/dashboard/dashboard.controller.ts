import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { OpensearchService } from 'apps/base-metric-service/src/opensearch/opensearch.service';
import {
  calculatorDashboardForDay,
  CreateIndexName,
  SearchDashboard,
} from 'apps/base-metric-service/src/opensearch/opensearch.dto';
import {
  approvedIndex,
  formatDate,
  responseHelper,
} from 'libs/utils/helper.util';
import console from 'node:console';

@ApiTags('Dashboard')
@Controller()
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly searchOpenService: OpensearchService) {}

  @Get('dashboard')
  async dashboard(
    @Query() query: SearchDashboard,
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    const result = await this.searchOpenService.dashboard(query, schema);
    return responseHelper(result);
  }

  @Post('approved-index-name')
  async create(@Body() query: CreateIndexName) {
    const result = await this.searchOpenService.approvedIndexName(query.schema);
    return responseHelper(result);
  }

  @Post('save-dashboard-for-day')
  async calculator(@Body() query: calculatorDashboardForDay) {
    const date = formatDate(new Date(query.date));
    const result = await this.searchOpenService.calculateTotalForDay(
      date,
      date,
      query.schema,
    );

    const updatedData = {
      ...result,
      data: {
        ...result.data,
        timestamp: new Date(query.date).toISOString(),
      },
    };

    const indexName = query.schema + '.dashboard_for_day';
    await this.searchOpenService.singleDataIngestionDashboard({
      indexName,
      data: updatedData,
    });

    return updatedData;
  }
}
