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
import { SegmentRouteMapService } from '../services/segment-route-map.service';
import {
  SegmentRouteContent,
  SegmentRouteCreateArrDto,
  SegmentRouteListRes,
  SegRouteQueryArrDto,
  SegmentRouteUpdateArrDto,
} from '../dtos/segment-route.dto';

@ApiTags('Segment Route')
@Controller('/segment-route')
@ApiBearerAuth()
export class SegmentRouteController {
  constructor(
    private segRouteService: SegmentRouteMapService,
    private importService: RouteImportService,
  ) {}

  @Post('/create')
  @ApiOperation({ summary: 'create multi segment route' })
  @ApiCreatedResponse({ type: SegmentRouteContent })
  async createSegmentRoute(@Body() body: SegmentRouteCreateArrDto) {
    return responseHelper(await this.segRouteService.create(body.data));
  }

  @Post('/import')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportDto })
  @ApiOperation({ summary: 'import create multi segment route' })
  @ApiCreatedResponse({ type: SegmentRouteListRes })
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
    return responseHelper(await this.segRouteService.create(data));
  }

  @Post('/list')
  @ApiOperation({ summary: 'list segment route' })
  @ApiOkResponse({ type: SegmentRouteListRes })
  async listSegRoute(@Body() body: SegRouteQueryArrDto) {
    const handlePage = handlePaginate(body);
    const { list, total } = await this.segRouteService.findAndCount(
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
  @ApiOperation({ summary: 'update multi segment route' })
  async updateSegmentRoutes(@Body() body: SegmentRouteUpdateArrDto) {
    return responseHelper(await this.segRouteService.updateMany(body.data));
  }

  @Delete('/delete-many')
  @ApiOperation({ summary: 'delete multi segment route' })
  async deleteSegmentRoutes(@Body() body: IdsDto) {
    return responseHelper(await this.segRouteService.deleteMany(body.ids));
  }
}
