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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { handlePaginate, responseHelper } from 'libs/utils/helper.util';
import { NUMBER_PAGE } from 'libs/common/constants/common.constant';
import { SectionService } from '../services/section.service';
import {
  SectionCreateArrDto,
  SectionListRes,
  SectionQueryArrDto,
  SectionUpdateArrDto,
} from '../dtos/section.dto';
import { IdsDto, ImportDto } from 'libs/dtos/base.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadFile } from 'libs/utils/multer';
import { RouteImportService } from 'libs/utils/route-import.service';

@ApiTags('Section')
@Controller('/section')
@ApiBearerAuth()
export class SectionController {
  constructor(
    private sectionService: SectionService,
    private importService: RouteImportService,
  ) {}

  @Post('/create')
  @ApiOperation({ summary: 'create multi Section' })
  @ApiOkResponse({ type: SectionListRes })
  async createRoute(@Body() body: SectionCreateArrDto) {
    return responseHelper(await this.sectionService.create(body.data));
  }

  @Post('/import')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportDto })
  @ApiOperation({ summary: 'import to create multi Section' })
  @ApiOkResponse({ type: SectionListRes })
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
    return responseHelper(await this.sectionService.create(data));
  }

  @Post('/list')
  @ApiOperation({ summary: 'list Section' })
  @ApiOkResponse({ type: SectionListRes })
  async listRoute(@Body() body: SectionQueryArrDto) {
    const handlePage = handlePaginate(body);
    const { list, total } = await this.sectionService.findAndCount(
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
  @ApiOperation({ summary: 'update multi Section' })
  async updatePoints(@Body() body: SectionUpdateArrDto) {
    return responseHelper(await this.sectionService.updateMany(body.data));
  }

  @Delete('/delete-many')
  @ApiOperation({ summary: 'delete multi Section' })
  async deleteRoutes(@Body() body: IdsDto) {
    return responseHelper(await this.sectionService.deleteMany(body.ids));
  }
}
