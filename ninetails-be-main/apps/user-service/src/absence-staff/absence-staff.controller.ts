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
import { AbsenceStaffService } from './absence-staff.service';
import {
  responseHelper,
  setDefaultQuerySearchValues,
} from 'libs/utils/helper.util';
import {
  AbsenceStaffCreateForm,
  AbsenceStaffDeleteManyForm,
  AbsenceStaffDeleteRes,
  AbsenceStaffListRes,
  AbsenceStaffRes,
  AbsenceStaffSearchForm,
  AbsenceStaffSearchReturnToWork,
  AbsenceStaffUpdateForm,
} from './absence-staff.dto';
import { BaseQueryReq } from 'libs/dtos/base.req';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Absence staff')
@ApiBearerAuth()
@Controller('absence-staff')
export class AbsenceStaffController {
  constructor(private readonly absenceStaffService: AbsenceStaffService) {}

  @Get('list')
  @ApiOkResponse({ type: AbsenceStaffListRes })
  async index(@Query() query: AbsenceStaffSearchForm) {
    const handleQuery = setDefaultQuerySearchValues(query) as any;
    const { items, total } = await this.absenceStaffService.index(handleQuery);
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

  @Get('back-to-work')
  @ApiOkResponse({ type: AbsenceStaffListRes })
  async getBackToWork(@Query() query: AbsenceStaffSearchReturnToWork) {
    const data = await this.absenceStaffService.backToWork(query);
    return responseHelper(data);
  }

  @Get(':id')
  @ApiOkResponse({ type: AbsenceStaffListRes })
  async detail(@Param('id') id: number) {
    const absenceStaff = await this.absenceStaffService.detail(id);
    return responseHelper(absenceStaff);
  }

  @Post('create')
  @ApiOkResponse({ type: AbsenceStaffRes })
  async create(@Body() input: AbsenceStaffCreateForm) {
    const data = await this.absenceStaffService.create(input);
    return responseHelper(
      data,
      true,
      200,
      'The absence-staff has been created successfully!',
    );
  }

  @Put('update/:id')
  @ApiOkResponse({ type: AbsenceStaffRes })
  async update(@Param('id') id: number, @Body() input: AbsenceStaffUpdateForm) {
    const data = await this.absenceStaffService.update(id, input);
    return responseHelper(
      data,
      true,
      200,
      'The absence-staff has been updated successfully!',
    );
  }

  @Delete('delete/:id')
  @ApiOkResponse({ type: AbsenceStaffDeleteRes })
  async delete(@Param('id') id: number) {
    const data = await this.absenceStaffService.delete(id);
    return responseHelper(
      data,
      true,
      200,
      'The absence-staff has been deleted successfully!',
    );
  }

  @Delete('delete-many')
  @ApiOkResponse({ type: AbsenceStaffDeleteRes })
  async deleteMany(@Body() body: AbsenceStaffDeleteManyForm) {
    const data = await this.absenceStaffService.deleteMany(body.ids);
    return responseHelper(
      data,
      true,
      200,
      'The absence-staff has been deleted successfully!',
    );
  }
}
