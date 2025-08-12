import {
  Body,
  Controller,
  Delete,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { handlePaginate, responseHelper } from 'libs/utils/helper.util';
import { NUMBER_PAGE } from 'libs/common/constants/common.constant';
import { IdsDto, ImportDto } from 'libs/dtos/base.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadFile } from 'libs/utils/multer';
import { RouteImportService } from 'libs/utils/route-import.service';
import { CongestionService } from '../services/congestion.service';
import {
  CongestionContent,
  CongestionCreateDtoArrDto,
  CongestionListRes,
  CongestionQueryArrDto,
  CongestionUpdateArrDto,
} from '../dtos/congestion.dto';

@ApiTags('Congestion')
@Controller('/congestion')
@ApiBearerAuth()
export class CongestionController {
  constructor(
    private congestionService: CongestionService,
    private importService: RouteImportService,
  ) {}

  @Post('/create')
  @ApiOperation({ summary: 'create multi congestion' })
  @ApiCreatedResponse({ type: CongestionContent })
  async createCongestion(@Body() body: CongestionCreateDtoArrDto) {
    return responseHelper(await this.congestionService.create(body.data));
  }

  @Post('/import')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportDto })
  @ApiOperation({ summary: 'import to create multi congestion' })
  @ApiCreatedResponse({ type: CongestionListRes })
  @UseInterceptors(FileInterceptor('file', uploadFile()))
  async importCongestion(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.importService.handleImportFile(file);
    return responseHelper(await this.congestionService.create(data));
  }

  @Post('list')
  @ApiOperation({ summary: 'list congestion' })
  @ApiOkResponse({ type: CongestionListRes })
  async listCongestion(@Body() body: CongestionQueryArrDto) {
    const handlePage = handlePaginate(body, 'code');
    const { list, total } = await this.congestionService.findAndCount(
      body.query,
      handlePage,
    );
    return responseHelper({
      data: list,
      pagination: {
        total,
        last_page: Math.ceil(total / +handlePage.take),
        per_page: +handlePage.take,
        current_page: body.page || NUMBER_PAGE.PAGE,
      },
    });
  }

  @Put('/update-many')
  @ApiOperation({ summary: 'update multi congestion' })
  async updateCongestions(@Body() body: CongestionUpdateArrDto) {
    return responseHelper(await this.congestionService.updateMany(body.data));
  }

  @Delete('/delete-many')
  @ApiOperation({ summary: 'delete multi congestion' })
  async deleteCongestions(@Body() body: IdsDto) {
    return responseHelper(await this.congestionService.deleteMany(body.ids));
  }
}
