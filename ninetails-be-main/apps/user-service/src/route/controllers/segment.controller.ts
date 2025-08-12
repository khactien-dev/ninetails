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
import { SegmentService } from '../services/segment.service';
import { handlePaginate, responseHelper } from 'libs/utils/helper.util';
import { NUMBER_PAGE } from 'libs/common/constants/common.constant';
import { IdsDto, ImportDto } from 'libs/dtos/base.dto';
import {
  SegmentCreateArrDto,
  SegmentListRes,
  SegmentQueryArrDto,
  SegmentUpdateArrDto,
} from '../dtos/segment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadFile } from 'libs/utils/multer';
import { RouteImportService } from 'libs/utils/route-import.service';

@Controller('/segment')
@ApiBearerAuth()
@ApiTags('Segment')
export class SegmentController {
  constructor(
    private segmentService: SegmentService,
    private importService: RouteImportService,
  ) {}

  @Post('/create')
  @ApiOperation({ summary: 'create multi segment' })
  @ApiCreatedResponse({ type: SegmentListRes })
  async createRoute(@Body() body: SegmentCreateArrDto) {
    return responseHelper(await this.segmentService.create(body.data));
  }

  @Post('/import')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportDto })
  @ApiOperation({ summary: 'import to create multi segment' })
  @ApiCreatedResponse({ type: SegmentListRes })
  @UseInterceptors(FileInterceptor('file', uploadFile()))
  async importPoint(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const values = await this.importService.handleImportFileArrField(file);
    return responseHelper(await this.segmentService.create(values));
  }

  @Post('/list')
  @ApiOperation({ summary: 'list segment' })
  @ApiOkResponse({ type: SegmentListRes })
  async listRoute(@Body() body: SegmentQueryArrDto) {
    const handlePage = handlePaginate(body);
    const { list, total } = await this.segmentService.findAndCount(
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
  @ApiOperation({ summary: 'update multi segment' })
  async updatePoints(@Body() body: SegmentUpdateArrDto) {
    return responseHelper(await this.segmentService.updateMany(body.data));
  }

  @Delete('/delete-many')
  @ApiOperation({ summary: 'delete multi segment' })
  async deleteRoutes(@Body() body: IdsDto) {
    return responseHelper(await this.segmentService.deleteMany(body.ids));
  }
}
