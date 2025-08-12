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
import { MetadataService } from '../services/metadata.service';
import {
  MetadataCreateArrDto,
  MetadataListRes,
  MetadataQueryArrDto,
  MetadataUpdateArrDto,
} from '../dtos/metadata.dto';
import { RouteImportService } from 'libs/utils/route-import.service';

@ApiTags('Metadata')
@Controller('/metadata')
@ApiBearerAuth()
export class MetadataController {
  constructor(
    private metadataService: MetadataService,
    private importService: RouteImportService,
  ) {}

  @Post('/create')
  @ApiCreatedResponse({ type: MetadataListRes })
  @ApiOperation({ summary: 'create multi metadata' })
  async createPoint(@Body() body: MetadataCreateArrDto) {
    return responseHelper(await this.metadataService.create(body.data));
  }

  @Post('/import')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportDto })
  @ApiOperation({ summary: 'create multi metadata' })
  @ApiCreatedResponse({ type: MetadataListRes })
  @UseInterceptors(FileInterceptor('file', uploadFile()))
  async importMetadata(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.importService.handleImportFile(file);
    return responseHelper(await this.metadataService.create(data));
  }

  @Post('/list')
  @ApiOkResponse({ type: MetadataListRes })
  @ApiOperation({ summary: 'list metadata' })
  async listpoint(@Body() body: MetadataQueryArrDto) {
    const handlePage = handlePaginate(body, 'table_name');
    const { list, total } = await this.metadataService.findAndCount(
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
  @ApiOperation({ summary: 'update multi metadata' })
  async updatePoints(@Body() body: MetadataUpdateArrDto) {
    return responseHelper(await this.metadataService.updateMany(body.data));
  }

  @Delete('/delete-many')
  @ApiOperation({ summary: 'delete multi metadata' })
  async deletePoints(@Body() body: IdsDto) {
    return responseHelper(await this.metadataService.deleteMany(body.ids));
  }
}
