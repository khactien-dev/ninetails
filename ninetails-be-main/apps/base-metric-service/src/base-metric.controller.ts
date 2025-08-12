import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { OpensearchService } from './opensearch/opensearch.service';
import { responseHelper } from 'libs/utils/helper.util';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseMetricService } from './base-metric.service';
import { DriveMetricService } from './drive-metric/drive-metric.service';
import { RealtimeActivityService } from './realtime-activity/realtime-activity.service';
import { RealtimeActivityDto } from './realtime-activity/realtime-activity.dto';
import { OperationAnalysisService } from './operation-analysis/operation-analysis.service';
import { DrivingRouteService } from './operation-analysis/power-graph/driving-route-graph/driving-route-graph.service';
import { OperationAnalysisDto } from './operation-analysis/operation-analysis.dto';
import { WidgetDatasetDto } from './operation-analysis/widget-dataset/widget-dataset.dto';
import { WidgetDatasetService } from './operation-analysis/widget-dataset/widget-dataset.service';
import { DrivingRouteGraphDto } from './operation-analysis/power-graph/driving-route-graph/driving-route-graph.dto';
import { CoreDatasetService } from './operation-analysis/core-dataset/core-dataset.service';
import { CollectCountGraphService } from './operation-analysis/power-graph/collect-count-graph/collect-count-graph.service';
import { ModuleDatasetService } from './operation-analysis/module-dataset/module-dataset.service';
import { CoreDataSetDto } from './operation-analysis/core-dataset/core-dataset.dto';
import { ModuleDatasetDto } from './operation-analysis/module-dataset/module-dataset.dto';
import { CollectCountGraphDto } from './operation-analysis/power-graph/collect-count-graph/collect-count-graph.dto';
import { CustomGraphDto } from './operation-analysis/power-graph/custom-graph/custom-graph.dto';
import {
  DashFakeDto,
  SearchForStatisticsDto,
  ToggleMessageDto,
} from './opensearch/opensearch.dto';
import { CustomGraphService } from './operation-analysis/power-graph/custom-graph/custom-graph.service';
import { RouteInfoService } from './datasource-service/route-info.service';
import { MetricWeightService } from './datasource-service/metric-weight.service';
import { MetricWeightDto } from './datasource-service/dto/metric-weight.dto';
import axios from 'axios';
import { CoordinateDto } from './base-metric.dto';

@ApiTags('Base Metric')
@ApiBearerAuth()
@Controller()
export class BaseMetricController {
  constructor(
    private readonly searchService: OpensearchService,
    private readonly baseMetricService: BaseMetricService,
    private readonly driveMetricService: DriveMetricService,
    private readonly realtimeActivityService: RealtimeActivityService,
    private readonly operationAnalysisService: OperationAnalysisService,
    private readonly widgetDatasetService: WidgetDatasetService,
    private readonly drivingRouteService: DrivingRouteService,
    private readonly coreDatasetService: CoreDatasetService,
    private readonly collectCountGraphService: CollectCountGraphService,
    private readonly moduleDatasetService: ModuleDatasetService,
    private readonly customGraphService: CustomGraphService,
    private readonly routeInfoService: RouteInfoService,
    private readonly metricWeightService: MetricWeightService,
  ) {}

  @Get('section-list')
  async getAllSection(
    @Query() searchForStatisticsDto: SearchForStatisticsDto,
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    const result = await this.driveMetricService.getAllSection(
      searchForStatisticsDto,
      schema,
    );
    return responseHelper(result);
  }

  @Get('route-simulation')
  async getRouteDataset(
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    const result = await this.routeInfoService.getRouteDatasetInfo(schema);
    return responseHelper(result);
  }

  @Get()
  async search(
    @Query() realtimeActivityDto: RealtimeActivityDto,
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    const result = await this.realtimeActivityService.getListVehicleData(
      realtimeActivityDto,
      schema,
    );
    return responseHelper(result);
  }

  @Get('vehicle_route/:index')
  async searchIndex(@Param('index') indexName: string) {
    const result = await this.searchService.searchIndex({ indexName });
    return responseHelper(result);
  }

  @Get('operation-analysis')
  async operationAnalysis(
    @Query() oerationAnalysisDto: OperationAnalysisDto,
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    const result = await this.operationAnalysisService.operationAnalysis(
      oerationAnalysisDto,
      schema,
    );
    return responseHelper(result);
  }

  @Get('route-list')
  async getRouteList(@Request() req: { headers: { schema: string } }) {
    const schema = req.headers.schema;
    // const result = await this.coreDatasetService.getOperatingRoutes(baseDto.startDate, baseDto.endDate, schema);
    const result = await this.routeInfoService.getAllRouteName(schema);
    return responseHelper(result);
  }

  @Get('route-simulation/:id')
  async getRouteSimulation(
    @Param('id') id: string,
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    const result = await this.routeInfoService.getRouteSimulationInfo(+id, schema);
    return responseHelper(result);
  }

  @Get('all-segments')
  async getAllSegments(@Request() req: { headers: { schema: string } },) {
    const schema = req.headers.schema;
    const result = await this.routeInfoService.getAllSegments(schema);
    return responseHelper(result);
  }

  @Get('widget-dataset')
  async datasetOther(
    @Query() WidgetDatasetDto: WidgetDatasetDto,
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    const result = await this.widgetDatasetService.getDriveMetricsWidgetDataSet(
      WidgetDatasetDto,
      schema,
    );
    return responseHelper(result);
  }

  @Get('metric-weight')
  async getMetricWeight(@Request() req: { headers: { schema: string } }) {
    const schema = req.headers.schema;
    const result = await this.metricWeightService.getMetricWeight(schema);
    return responseHelper(result);
  }

  @Get('core-dataset')
  async getCoreDataset(
    @Query() coreDataSetDto: CoreDataSetDto,
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    const result = await this.coreDatasetService.getCoreDataset(
      coreDataSetDto,
      schema,
    );
    return responseHelper(result);
  }

  @Post('module-dataset')
  async getModuleDataset(
    @Body() moduleDatasetDto: ModuleDatasetDto,
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    const result = await this.moduleDatasetService.getModuleDataset(
      moduleDatasetDto,
      schema,
    );
    return responseHelper(result);
  }

  @Get('driving-route-graph')
  async getDrivingRouteGraph(
    @Query() drivingRouteGraphDto: DrivingRouteGraphDto,
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    const result = await this.drivingRouteService.getDrivingRouteGraph(
      drivingRouteGraphDto,
      schema,
    );
    return responseHelper(result);
  }

  @Get('collect-count-graph')
  async getCollectCountGraph(
    @Query() collectCountGraphDto: CollectCountGraphDto,
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    const result = await this.collectCountGraphService.getCollectCountGraph(
      collectCountGraphDto,
      schema,
    );
    return responseHelper(result);
  }

  @Post('custom-graph')
  async getCustomGraph(
    @Body() customGraphDto: CustomGraphDto,
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    const result = await this.customGraphService.getCustomGraph(
      customGraphDto,
      schema,
    );
    return responseHelper(result);
  }

  @Post('toggle')
  toggleSendingMessages(@Body() toggleMessageDto: ToggleMessageDto) {
    this.baseMetricService.toggleSendingMessages(toggleMessageDto);
    return {
      message: toggleMessageDto.start
        ? 'Started sending messages'
        : 'Stopped sending messages',
    };
  }

  // @Post('dashboard-fake')
  // async dashboardFake(@Body() dashFakeDto: DashFakeDto) {
  //   if (dashFakeDto.start) {
  //     try {
  //       await this.searchService.saveDataCalculateTotalForDay2(dashFakeDto.timestamp);
  //       console.log(
  //           'Data has been successfully saved to data calculate dashboard.',
  //       );
  //     } catch (error) {
  //       console.error('Error saving data to data calculate dashboard.:', error);
  //     }
  //   } else if (!dashFakeDto.start) {
  //     return null
  //   }
  // }

  @Post('send-message')
  SendMessage(@Body('message') message: any) {
    this.baseMetricService.sendMessage2(message);
    return true;
  }

  @Post('metric-weight')
  async insertMetricWeight(
    @Body() metricWeightDto: MetricWeightDto,
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    await this.metricWeightService.insertMetricWeight(schema, metricWeightDto);
    return responseHelper({ message: 'Metric weight inserted successfully' });
  }

  @Put('metric-weight')
  async updateMetricWeight(
    @Body() metricWeightDto: MetricWeightDto,
    @Request() req: { headers: { schema: string } },
  ) {
    const schema = req.headers.schema;
    await this.metricWeightService.updateMetricWeight(schema, metricWeightDto);
    return responseHelper({ message: 'Metric weight updated successfully' });
  }

  @Post('/polygon')
  async polygonNaver(@Body() coordinateDto: CoordinateDto) {
    const result = await this.baseMetricService.getCoordinatesAPI(coordinateDto)
    return result
  }
}
