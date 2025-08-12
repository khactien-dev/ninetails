import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import {
  responseHelper,
  setDefaultQuerySearchValues,
} from 'libs/utils/helper.util';
import {
  SearchValueVehicleReq,
  VehicleCreateForm,
  VehicleDeleteManyForm,
  VehicleDeleteManyRes,
  VehicleDeleteRes,
  VehicleListRes,
  VehicleSaveRes,
  VehicleUpdateForm,
  VehicleUpdateManyForm,
  VehicleUpdateManyRes,
} from './vehicle.dto';
import { BaseQueryReq } from 'libs/dtos/base.req';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Vehicle')
@ApiBearerAuth()
@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  @ApiOkResponse({ type: VehicleListRes })
  async list(@Query() query: SearchValueVehicleReq) {
    const handleQuery = setDefaultQuerySearchValues(query) as any;
    const { vehicles, total } = await this.vehicleService.list(handleQuery);
    return responseHelper({
      data: vehicles,
      pagination: {
        total: total,
        current_page: Number(query.page),
        per_page: Number(query.pageSize),
        last_page: Math.ceil(total / Number(query.pageSize)),
      },
    });
  }

  @Get(':id')
  @ApiOkResponse({ type: VehicleSaveRes })
  async detail(@Param('id') id: number) {
    const data = await this.vehicleService.detail(id);
    return responseHelper(data);
  }

  @Post('create')
  @ApiOkResponse({ type: VehicleSaveRes })
  async create(@Body() input: VehicleCreateForm) {
    const data = await this.vehicleService.create(input);
    return responseHelper(
      data,
      true,
      200,
      'The vehicle has been created successfully!',
    );
  }

  @Put(':id')
  @ApiOkResponse({ type: VehicleSaveRes })
  async update(@Param('id') id: number, @Body() input: VehicleUpdateForm) {
    const data = await this.vehicleService.update(id, input);
    return responseHelper(
      data,
      true,
      200,
      'The vehicle has been updated successfully!',
    );
  }

  @Delete('delete-many')
  @ApiOkResponse({ type: VehicleDeleteManyRes })
  async deleteMany(@Body() input: VehicleDeleteManyForm) {
    const data = await this.vehicleService.deleteMany(input.ids);
    return responseHelper(
      data,
      true,
      200,
      'The vehicles has been deleted successfully!',
    );
  }

  @Delete(':id')
  @ApiOkResponse({ type: VehicleDeleteRes })
  async delete(@Param('id') id: number) {
    const data = await this.vehicleService.delete(id);
    return responseHelper(
      data,
      true,
      200,
      'The vehicle has been deleted successfully!',
    );
  }

  @Patch('update-many')
  @ApiOkResponse({ type: VehicleUpdateManyRes })
  async updateMany(@Body() input: VehicleUpdateManyForm) {
    const data = await this.vehicleService.updateMany(input.ids, input.input);
    return responseHelper(
      data,
      true,
      200,
      'The vehicles has been updated successfully!',
    );
  }
}
