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
import { PointService } from '../services/point.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadFile } from 'libs/utils/multer';
import {
  PointCreateArrDto,
  PointListRes,
  PointQueryArrDto,
  PointUpdateArrDto,
} from '../dtos/point.dto';
import { RouteImportService } from 'libs/utils/route-import.service';

@ApiTags('Point')
@Controller('/point')
@ApiBearerAuth()
export class PointController {
  constructor(
    private pointService: PointService,
    private importService: RouteImportService,
  ) {}

  @Post('/create')
  @ApiCreatedResponse({ type: PointListRes })
  @ApiOperation({ summary: 'create multi point' })
  async createPoint(@Body() body: PointCreateArrDto) {
    return responseHelper(await this.pointService.create(body.data));
  }

  @Post('/import')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportDto })
  @ApiOperation({ summary: 'import to create multi point' })
  @ApiCreatedResponse({ type: PointListRes })
  @UseInterceptors(FileInterceptor('file', uploadFile()))
  async importPoint(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.importService.handleImportFile(file);
    return responseHelper(await this.pointService.create(data));
  }

  @Post('/list')
  @ApiOkResponse({ type: PointListRes })
  @ApiOperation({ summary: 'list point' })
  async listPoint(@Body() body: PointQueryArrDto) {
    const handlePage = handlePaginate(body);
    const { list, total } = await this.pointService.findAndCount(
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
  @ApiOperation({ summary: 'update multi point' })
  async updatePoints(@Body() body: PointUpdateArrDto) {
    return responseHelper(await this.pointService.updateMany(body.data));
  }

  @Delete('/delete-many')
  @ApiOperation({ summary: 'delete multi point' })
  async deletePoints(@Body() body: IdsDto) {
    return responseHelper(await this.pointService.deleteMany(body.ids));
  }
}
