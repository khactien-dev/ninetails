import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  responseHelper,
  setDefaultQuerySearchValues,
} from 'libs/utils/helper.util';
import { WorkingScheduleService } from './working-schedule.service';
import {
  CreateWorkingScheduleReq,
  CreateWorkingScheduleRes,
  DeleteWorkingScheduleReq,
  SearchWorkingScheduleReq,
  UpdateWorkingScheduleReq,
} from '../dto/working-schedule.dto';

@ApiTags('Working Schedule')
@Controller('working-schedule')
@ApiBearerAuth()
export class WorkingScheduleController {
  constructor(
    private readonly workingScheduleService: WorkingScheduleService,
  ) {}

  @Get()
  @ApiCreatedResponse({ type: CreateWorkingScheduleRes })
  async getAllWorkingSchedule(
    @Request() req: { headers: { schema: string } },
    @Query() payload: SearchWorkingScheduleReq,
  ) {
    payload.schema = req.headers.schema;
    const query = setDefaultQuerySearchValues(payload);
    const { workingSchedules, total } =
      await this.workingScheduleService.getAll(query);
    return responseHelper({
      data: workingSchedules,
      pagination: {
        total,
        last_page: Math.ceil(total / +query.pageSize),
        per_page: query.pageSize,
        current_page: query.page,
      },
    });
  }

  @Get('list')
  @ApiCreatedResponse({ type: CreateWorkingScheduleRes })
  async getWorkShift(
    @Request() req: { headers: { schema: string } },
    @Query() payload: SearchWorkingScheduleReq,
  ) {
    payload.schema = req.headers.schema;
    const query = setDefaultQuerySearchValues(payload);
    const { workingSchedules, total } =
      await this.workingScheduleService.findAndCount(query);
    return responseHelper({
      data: workingSchedules,
      pagination: {
        total,
        last_page: Math.ceil(total / +query.pageSize),
        per_page: query.pageSize,
        current_page: query.page,
      },
    });
  }

  @Get('/statistic')
  @ApiOkResponse({ type: CreateWorkingScheduleRes })
  async getScheduleWithStatistic(
    @Request() req: { headers: { schema: string } },
    @Query() payload: SearchWorkingScheduleReq,
  ) {
    payload.schema = req.headers.schema;
    const query = setDefaultQuerySearchValues(payload);
    const { total, statistics, staffSection, vehicleSection } =
      await this.workingScheduleService.getWithStatistic(query);
    return responseHelper({
      statistics,
      staffSection,
      vehicleSection,
      pagination: {
        total,
        last_page: Math.ceil(total / +query.pageSize),
        per_page: query.pageSize,
        current_page: query.page,
      },
    });
  }

  @Get(':id')
  @ApiCreatedResponse({ type: CreateWorkingScheduleRes })
  async detail(@Param('id') id: number) {
    const workingSchedule = await this.workingScheduleService.detail(id);
    return responseHelper(workingSchedule);
  }

  @Post('create')
  @ApiCreatedResponse({ type: CreateWorkingScheduleRes })
  async create(@Body() body: CreateWorkingScheduleReq) {
    const workingSchedule = await this.workingScheduleService.create(body);
    return responseHelper(workingSchedule);
  }

  @Put('update/:id')
  @ApiCreatedResponse({ type: CreateWorkingScheduleRes })
  async update(
    @Param('id') id: number,
    @Body() body: UpdateWorkingScheduleReq,
  ) {
    const workingSchedule = await this.workingScheduleService.update(id, body);
    return responseHelper(workingSchedule);
  }

  @Delete('delete')
  @ApiCreatedResponse({ type: CreateWorkingScheduleRes })
  async delete(@Body() body: DeleteWorkingScheduleReq) {
    const workingSchedule = await this.workingScheduleService.delete(body);
    return responseHelper(workingSchedule);
  }
}
