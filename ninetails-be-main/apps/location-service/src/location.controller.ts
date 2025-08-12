import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  CreateLocationReq,
  DeleteLocationReq,
  DetailLocationRes,
  ListLocationRes,
  UpdateLocationReq,
} from './location.dto';
import {
  responseHelper,
  setDefaultQuerySearchValues,
} from 'libs/utils/helper.util';
import { AuthenAdminGuard } from '../../user-service/src/guards/auth.guard';
import { BaseQueryReq } from '../../../libs/dtos/base.req';

@ApiTags('Location')
@Controller()
@ApiBearerAuth()
@UseGuards(AuthenAdminGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  @ApiOkResponse({ type: ListLocationRes })
  async get(@Query() query: BaseQueryReq) {
    const handleQuery = setDefaultQuerySearchValues(query);
    const { items, total } = await this.locationService.get(handleQuery);
    const data = {
      data: items,
      pagination: {
        total: total,
        current_page: Number(query.page),
        per_page: Number(query.pageSize),
        last_page: Math.ceil(total / Number(query.pageSize)),
      },
    };
    return responseHelper(data);
  }

  @Get(':id')
  @ApiCreatedResponse({ type: DetailLocationRes })
  async detail(@Param('id') id: number) {
    const location = await this.locationService.detail(id);
    return responseHelper(location);
  }

  @Post('create')
  @ApiCreatedResponse({ type: DetailLocationRes })
  async create(@Body() body: CreateLocationReq) {
    const location = await this.locationService.create(body);
    return responseHelper(location);
  }

  @Put('update/:id')
  @ApiCreatedResponse({ type: DetailLocationRes })
  async update(@Param('id') id: number, @Body() body: UpdateLocationReq) {
    const location = await this.locationService.update(id, body);
    return responseHelper(location);
  }

  @Delete('delete/:id')
  @ApiOkResponse({ type: DetailLocationRes })
  async delete(@Body() body: DeleteLocationReq) {
    const location = await this.locationService.delete(body);
    return responseHelper(location);
  }
}
