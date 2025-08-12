import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AbsenceVehicleService } from './absence-vehicle.service';
import {
  responseHelper,
  setDefaultQuerySearchValues,
} from 'libs/utils/helper.util';
import {
  AbsenceVehicleCloset,
  AbsenceVehicleCreateForm,
  AbsenceVehicleDeleteManyForm,
  AbsenceVehicleDeleteManyRes,
  AbsenceVehicleDeleteRes,
  AbsenceVehicleListRes,
  AbsenceVehicleRes,
  AbsenceVehicleSearchForm,
  AbsenceVehicleUpdateForm,
} from './absence-vehicle.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Absence vehicle')
@ApiBearerAuth()
@Controller('absence-vehicle')
export class AbsenceVehicleController {
  constructor(private readonly absenceVehicleService: AbsenceVehicleService) {}

  @Get('list')
  @ApiOkResponse({ type: AbsenceVehicleListRes })
  async index(@Query() query: AbsenceVehicleSearchForm) {
    const handleQuery = setDefaultQuerySearchValues(query) as any;
    const { items, total } =
      await this.absenceVehicleService.index(handleQuery);
    return responseHelper({
      data: items,
      pagination: {
        total: total,
        current_page: Number(query.page),
        per_page: Number(query.pageSize),
        last_page: Math.ceil(total / Number(query.pageSize)),
      },
    });
  }

  @Get('closet')
  @ApiOkResponse({ type: AbsenceVehicleListRes })
  async closet(@Query() query: AbsenceVehicleCloset) {
    const handleQuery = setDefaultQuerySearchValues(query) as any;
    const { items, total } =
      await this.absenceVehicleService.findByEndDate(handleQuery);
    return responseHelper({
      data: items,
      pagination: {
        total: total,
        current_page: Number(query.page),
        per_page: Number(query.pageSize),
        last_page: Math.ceil(total / Number(query.pageSize)),
      },
    });
  }

  @Get('/detail/:id')
  @ApiOkResponse({ type: AbsenceVehicleRes })
  async getDetail(@Param('id') id: number) {
    const data = await this.absenceVehicleService.findById(+id);
    return responseHelper(data, true, 200);
  }

  @Post('create')
  @ApiOkResponse({ type: AbsenceVehicleRes })
  async create(@Body() input: AbsenceVehicleCreateForm) {
    const data = await this.absenceVehicleService.create(input);
    return responseHelper(
      data,
      true,
      200,
      'The absence-vehicle has been created successfully!',
    );
  }

  @Put('update/:id')
  @ApiOkResponse({ type: AbsenceVehicleRes })
  async update(
    @Param('id') id: number,
    @Body() input: AbsenceVehicleUpdateForm,
  ) {
    const data = await this.absenceVehicleService.update(id, input);
    return responseHelper(
      data,
      true,
      200,
      'The absence-vehicle has been updated successfully!',
    );
  }

  @Delete('delete/:id')
  @ApiOkResponse({ type: AbsenceVehicleDeleteRes })
  async delete(@Param('id') id: number) {
    const data = await this.absenceVehicleService.delete(id);
    return responseHelper(
      data,
      true,
      200,
      'The absence-vehicle has been deleted successfully!',
    );
  }

  @Delete('delete-many')
  @ApiOkResponse({ type: AbsenceVehicleDeleteManyRes })
  async deleteMany(@Body() input: AbsenceVehicleDeleteManyForm) {
    const data = await this.absenceVehicleService.deleteMany(input.ids);
    return responseHelper(
      data,
      true,
      200,
      'The absence-vehicle has been deleted successfully!',
    );
  }
}
