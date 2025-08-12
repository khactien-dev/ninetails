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
import { GuideService } from '../services/guide.service';
import {
  GuideCodeCreateArrDto,
  GuideCodeListRes,
  GuideCodeQueryArrDto,
  GuideCodeUpdateArrDto,
  GuideCreateArrDto,
  GuideListRes,
  GuideQueryArrDto,
  GuideUpdateArrDto,
} from '../dtos/guide.dto';
import { handlePaginate, responseHelper } from 'libs/utils/helper.util';
import { IdsDto, ImportDto } from 'libs/dtos/base.dto';
import { NUMBER_PAGE } from 'libs/common/constants/common.constant';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadFile } from 'libs/utils/multer';
import { RouteImportService } from 'libs/utils/route-import.service';

@Controller('guide')
@ApiTags('Guide')
@ApiBearerAuth()
export class GuideController {
  constructor(
    private guideService: GuideService,
    private importService: RouteImportService,
  ) {}

  @Post('create')
  @ApiCreatedResponse({ type: GuideListRes })
  @ApiOperation({ summary: 'create multi Guide' })
  async guideCreate(@Body() body: GuideCreateArrDto) {
    return responseHelper(await this.guideService.create(body.data));
  }

  @Post('guide-code/create')
  @ApiCreatedResponse({ type: GuideCodeListRes })
  @ApiOperation({ summary: 'create multi Guide Code' })
  async guideCodeCreate(@Body() body: GuideCodeCreateArrDto) {
    return responseHelper(await this.guideService.createGuideCode(body.data));
  }

  @Post('/import')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'import to create multi Guide' })
  @ApiCreatedResponse({ type: GuideListRes })
  @ApiBody({ type: ImportDto })
  @UseInterceptors(FileInterceptor('file', uploadFile()))
  async importGuide(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.importService.handleImportFile(file);
    return responseHelper(await this.guideService.create(data));
  }

  @Post('guide-code/import')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportDto })
  @ApiCreatedResponse({ type: GuideCodeListRes })
  @ApiOperation({ summary: 'import to create multi Guide Code' })
  @UseInterceptors(FileInterceptor('file', uploadFile()))
  async importGuideCode(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.importService.handleImportFile(file);
    return responseHelper(await this.guideService.createGuideCode(data));
  }

  @Post('list')
  @ApiOperation({ summary: 'List Guide' })
  @ApiOkResponse({ type: GuideListRes })
  async listGuide(@Body() body: GuideQueryArrDto) {
    const handlePage = handlePaginate(body);
    const { list, total } = await this.guideService.findAndCount(
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

  @Post('guide-code/list')
  @ApiOkResponse({ type: GuideCodeListRes })
  @ApiOperation({ summary: 'List Guide Code' })
  async listGuideCode(@Body() body: GuideCodeQueryArrDto) {
    const handlePage = handlePaginate(body, 'code');
    const { list, total } = await this.guideService.findAndCountGuideCode(
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
  @ApiOperation({ summary: 'update multi Guide' })
  async updateGuides(@Body() body: GuideUpdateArrDto) {
    return responseHelper(await this.guideService.updateMany(body.data));
  }

  @Delete('/delete-many')
  @ApiOperation({ summary: 'delete multi Guide' })
  async deleteGuides(@Body() body: IdsDto) {
    return responseHelper(await this.guideService.deleteMany(body.ids));
  }

  @Put('guide-code/update-many')
  @ApiOperation({ summary: 'update multi Guide Code' })
  async updateGuideCodes(@Body() body: GuideCodeUpdateArrDto) {
    return responseHelper(
      await this.guideService.updateManyGuideCode(body.data),
    );
  }

  @Delete('guide-code/delete-many')
  @ApiOperation({ summary: 'delete multi Guide Code' })
  async deleteGuidecodes(@Body() body: IdsDto) {
    return responseHelper(
      await this.guideService.deleteManyGuideCode(body.ids),
    );
  }
}
