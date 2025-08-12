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
} from '@nestjs/common';
import { EdgeServeService } from './edge-serve.service';
import {
  responseHelper,
  setDefaultQuerySearchValues,
} from 'libs/utils/helper.util';
import {
  EdgeServeCreateForm,
  EdgeServeDeleteManyForm,
  EdgeServeDeleteManyRes,
  EdgeServeDeleteRes,
  EdgeServeListRes,
  EdgeServeReq,
  EdgeServeSaveRes,
  EdgeServeUpdateForm,
  EdgeServeUpdateManyForm,
  EdgeServeUpdateManyRes,
} from './edge-serve.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Edge Serve')
@ApiBearerAuth()
@Controller('edge-serve')
export class EdgeServeController {
  constructor(private readonly edgeServeService: EdgeServeService) {}

  @Get()
  @ApiOkResponse({ type: EdgeServeListRes })
  async list(@Query() query: EdgeServeReq) {
    const handleQuery = setDefaultQuerySearchValues(query);
    const { items, total } = await this.edgeServeService.list(handleQuery);
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

  @Get(':id')
  @ApiOkResponse({ type: EdgeServeSaveRes })
  async detail(@Param('id') id: number) {
    const data = await this.edgeServeService.detail(id);
    return responseHelper(data);
  }

  @Post('create')
  @ApiOkResponse({ type: EdgeServeSaveRes })
  async create(@Body() input: EdgeServeCreateForm) {
    const data = await this.edgeServeService.create(input);
    return responseHelper(
      data,
      true,
      200,
      'The edge-serve has been created successfully!',
    );
  }

  @Put(':id')
  @ApiOkResponse({ type: EdgeServeSaveRes })
  async update(@Param('id') id: number, @Body() input: EdgeServeUpdateForm) {
    const data = await this.edgeServeService.update(id, input);
    return responseHelper(
      data,
      true,
      200,
      'The edge-serve has been updated successfully!',
    );
  }

  @Delete('delete-many')
  @ApiOkResponse({ type: EdgeServeDeleteManyRes })
  async deleteMany(@Body() input: EdgeServeDeleteManyForm) {
    const data = await this.edgeServeService.deleteMany(input.ids);
    return responseHelper(
      data,
      true,
      200,
      'The edge-serve has been deleted successfully!',
    );
  }

  @Delete(':id')
  @ApiOkResponse({ type: EdgeServeDeleteRes })
  async delete(@Param('id') id: number) {
    const data = await this.edgeServeService.delete(id);
    return responseHelper(
      data,
      true,
      200,
      'The edge-serve has been deleted successfully!',
    );
  }

  @Patch('update-many')
  @ApiOkResponse({ type: EdgeServeUpdateManyRes })
  async updateMany(@Body() input: EdgeServeUpdateManyForm) {
    const data = await this.edgeServeService.updateMany(input.ids, input.input);
    return responseHelper(
      data,
      true,
      200,
      'The edge-serve has been updated successfully!',
    );
  }
}
