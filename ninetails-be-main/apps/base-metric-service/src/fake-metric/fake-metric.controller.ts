import { Body, Controller, Post } from '@nestjs/common';
import { responseHelper } from 'libs/utils/helper.util';

import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FakeMetricService } from './fake-metric.service';
import {
  CreateCollectMetricData,
  CreateDriveMetricData,
  CreateDriveMetricData5,
  CreateEdgeStateData,
  CreateIllegalDischargeData,
  CreateVehicleInfoData,
  CreateVehicleRouteData,
  CreateZscoreRollupData,
} from './fake-metric.dto';

@ApiTags('Fake Data')
@Controller()
export class FakeMetricController {
  constructor(private readonly service: FakeMetricService) {}

  @Post('fake-data/driver-metric/create')
  @ApiOkResponse()
  async createDriveMetric(@Body() input: CreateDriveMetricData) {
    // input.topic = 'drive_metrics';
    const data = await this.service.createDrive(input);
    return responseHelper(data);
  }

  @Post('fake-data/driver-metric/create-mode-5')
  @ApiOkResponse()
  async createDriveMetricMode5(@Body() input: CreateDriveMetricData5) {
    const data = await this.service.createDriveMode5(input);
    return responseHelper(data);
  }

  @Post('fake-data/vehicle-info/create')
  @ApiOkResponse()
  async createVehicleInfo(@Body() input: CreateVehicleInfoData) {
    const data = await this.service.create(input);

    return responseHelper(data);
  }

  @Post('fake-data/vehicle-route/create')
  @ApiOkResponse()
  async createVehicleRoute(@Body() input: CreateVehicleRouteData) {
    const data = await this.service.create(input);

    return responseHelper(data);
  }

  @Post('fake-data/collect-metric/create')
  @ApiOkResponse()
  async createCollectMetric(@Body() input: CreateCollectMetricData) {
    const data = await this.service.create(input);

    return responseHelper(data);
  }

  @Post('fake-data/edge-state-metrics/create')
  @ApiOkResponse()
  async createEdgeState(@Body() input: CreateEdgeStateData) {
    const data = await this.service.createEdgeState(input);

    return responseHelper(data);
  }

  @Post('fake-data/zscore-rollup/create')
  @ApiOkResponse()
  async createZscoreRollup(@Body() input: CreateZscoreRollupData) {
    const data = await this.service.create(input);

    return responseHelper(data);
  }

  @Post('fake-data/illegal-discharge/create')
  @ApiOkResponse()
  async createIllegalDischarge(@Body() input: CreateIllegalDischargeData) {
    const data = await this.service.create(input);

    return responseHelper(data);
  }
}
