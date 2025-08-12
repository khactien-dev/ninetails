import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RevertDataService } from './revert.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { handlePaginate, responseHelper } from 'libs/utils/helper.util';
import { ActionRevertDto, StorageQueryDto } from './revert.dto';
import { NUMBER_PAGE } from 'libs/common/constants/common.constant';

@Controller('revert')
@ApiTags('Revert')
@ApiBearerAuth()
export class RevertDataController {
  constructor(private revertService: RevertDataService) {}

  @Post('/action')
  async revertData(@Body() body: ActionRevertDto) {
    return responseHelper(
      await this.revertService.revertData(body.id, body.table),
    );
  }

  @Get('/list')
  async listRevert(@Query() query: StorageQueryDto) {
    const handlePage = handlePaginate(query);
    const { list, total } = await this.revertService.listRevert(
      query,
      handlePage,
    );
    return responseHelper({
      data: list,
      pagination: {
        total,
        last_page: Math.ceil(total / +handlePage.take),
        per_page: +handlePage.take,
        current_page: query.page || NUMBER_PAGE.PAGE,
      },
    });
  }
}
