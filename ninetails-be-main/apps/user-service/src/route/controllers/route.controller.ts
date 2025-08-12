import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RouteService } from '../services/route.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  FileExampleDto,
  RouteCreateArrDto,
  RouteListRes,
  RouteQueryArrDto,
  RouteUpdateArrDto,
  SaveAllRouteManageDto,
} from '../dtos/route.dto';
import { handlePaginate, responseHelper } from 'libs/utils/helper.util';
import { NUMBER_PAGE } from 'libs/common/constants/common.constant';
import { IdsDto, ImportDto } from 'libs/dtos/base.dto';
import { RouteImportService } from 'libs/utils/route-import.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadFile } from 'libs/utils/multer';
import { Response } from 'express';

@ApiTags('Route')
@Controller('/route')
@ApiBearerAuth()
export class RouteController {
  constructor(
    private routeService: RouteService,
    private importService: RouteImportService,
  ) {}

  @Get('route-simulation/:id')
  async getRouteSimulation(@Param('id') id: number) {
    return responseHelper(await this.routeService.routeSimulation(id));
  }

  @Post('/create')
  @ApiCreatedResponse({ type: RouteListRes })
  async createRoute(@Body() body: RouteCreateArrDto) {
    return responseHelper(await this.routeService.create(body.data));
  }

  @Post('/create-all')
  async saveAllRouteManage(@Body() body: SaveAllRouteManageDto) {
    return responseHelper(await this.routeService.saveAllRouteManage(body));
  }

  @Post('/import')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportDto })
  @ApiCreatedResponse({ type: RouteListRes })
  @ApiOperation({ summary: 'import to create multi point' })
  @UseInterceptors(FileInterceptor('file', uploadFile()))
  async importRoute(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.importService.handleImportFileArrField(file);
    return responseHelper(await this.routeService.create(data));
  }

  @Post('/list')
  @ApiOkResponse({ type: RouteListRes })
  async listRoute(@Body() body: RouteQueryArrDto) {
    const handlePage = handlePaginate(body);
    const { list, total } = await this.routeService.findAndCount(
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
  async updateRoutes(@Body() body: RouteUpdateArrDto) {
    return responseHelper(await this.routeService.updateMany(body.data));
  }

  @Delete('/delete-many')
  async deleteRoutes(@Body() body: IdsDto) {
    return responseHelper(await this.routeService.deleteMany(body.ids));
  }

  @Get('download-example')
  async downloadExample(@Query() query: FileExampleDto, @Res() res: Response) {
    return res.download(
      `${process.env.EXAMPLE_FILES_DESTINATION}/${query.type}.zip`,
    );
  }

  @Get('erd')
  erd() {
    const erd = {
      tables: [
        {
          name: 'route',
          description: 'This table contains transactions of all route.',
          schemaColor: '#91C4F2',
          columns: [
            {
              name: 'id',
              key: true,
              description: 'Unique identifier of a transaction.',
              type: 'bigint',
            },
            {
              name: 'name',
              description: 'ID of a vendor from the vendors table.',
              type: 'varchar',
              handleType: 'target',
            },
            {
              name: 'start',
              description:
                "Transaction's amount in USD. Positive value indicates a **credit** transaction, negative indicates **debit** transaction.",
              type: 'json',
            },
            {
              name: 'goal',
              description: 'Timestamp of a transaction.',
              type: 'json',
            },
            {
              name: 'distance',
              description: 'Timestamp of a transaction.',
              type: 'integer',
            },
            {
              name: 'duration',
              description: 'Timestamp of a transaction.',
              type: 'integer',
            },
            {
              name: 'bbox',
              description: 'Timestamp of a transaction.',
              type: 'json',
            },
            {
              name: 'path',
              description: 'Timestamp of a transaction.',
              type: 'json',
            },
            {
              name: 'collect_count',
              description: 'Timestamp of a transaction.',
              type: 'integer',
            },
            {
              name: 'collect_volume',
              description: 'Timestamp of a transaction.',
              type: 'integer',
            },
          ],
        },
        {
          name: 'segment',
          description: 'This table contains all vendors.',
          schemaColor: '#91C4F2',
          columns: [
            {
              name: 'id',
              description:
                'Unique identifier of a vendor. A vendor can have **credit** transactions with us (pay us money) and **debit** transactions (we pay money to a vendor).',
              type: 'bigint',
              handleType: 'source',
            },
            {
              name: 'name',
              description: "Vendor's name (could be a person or a company).",
              type: 'varchar',
            },
            {
              name: 'congestion',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'duration',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'must_pass',
              description: "Vendor's name (could be a person or a company).",
              type: 'boolean',
            },
            {
              name: 'manual_collect',
              description: "Vendor's name (could be a person or a company).",
              type: 'boolean',
            },
            {
              name: 'distance',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'collect_count',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'segment_line',
              description: "Vendor's name (could be a person or a company).",
              type: 'json',
            },
            {
              name: 'collect_volume',
              description: 'Timestamp of a transaction.',
              type: 'integer',
            },
          ],
        },
        {
          name: 'section',
          description: 'This table contains all vendors.',
          schemaColor: '#91C4F2',
          columns: [
            {
              name: 'id',
              description:
                'Unique identifier of a vendor. A vendor can have **credit** transactions with us (pay us money) and **debit** transactions (we pay money to a vendor).',
              type: 'bigint',
              handleType: 'source',
            },
            {
              name: 'name',
              description: "Vendor's name (could be a person or a company).",
              type: 'varchar',
            },
            {
              name: 'route_id',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'point_index',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'point_count',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'distance',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'congestion',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'duration',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'collect_count',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'collect_volume',
              description: 'Timestamp of a transaction.',
              type: 'integer',
            },
          ],
        },
        {
          name: 'point',
          description: 'This table contains all vendors.',
          schemaColor: '#91C4F2',
          columns: [
            {
              name: 'id',
              description:
                'Unique identifier of a vendor. A vendor can have **credit** transactions with us (pay us money) and **debit** transactions (we pay money to a vendor).',
              type: 'bigint',
              handleType: 'source',
            },
            {
              name: 'name',
              description: "Vendor's name (could be a person or a company).",
              type: 'varchar',
            },
            {
              name: 'segment_id',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'point_index',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
          ],
        },
        {
          name: 'congestion_code',
          description: 'This table contains all vendors.',
          schemaColor: '#91C4F2',
          columns: [
            {
              name: 'code',
              description:
                'Unique identifier of a vendor. A vendor can have **credit** transactions with us (pay us money) and **debit** transactions (we pay money to a vendor).',
              type: 'bigint',
              handleType: 'source',
            },
            {
              name: 'description',
              description: "Vendor's name (could be a person or a company).",
              type: 'varchar',
            },
          ],
        },
        {
          name: 'guide_code',
          description: 'This table contains all vendors.',
          schemaColor: '#91C4F2',
          columns: [
            {
              name: 'code',
              description:
                'Unique identifier of a vendor. A vendor can have **credit** transactions with us (pay us money) and **debit** transactions (we pay money to a vendor).',
              type: 'bigint',
              handleType: 'source',
            },
            {
              name: 'description',
              description: "Vendor's name (could be a person or a company).",
              type: 'varchar',
            },
          ],
        },
        {
          name: 'guide',
          description: 'This table contains all vendors.',
          schemaColor: '#91C4F2',
          columns: [
            {
              name: 'id',
              description:
                'Unique identifier of a vendor. A vendor can have **credit** transactions with us (pay us money) and **debit** transactions (we pay money to a vendor).',
              type: 'bigint',
              handleType: 'source',
            },
            {
              name: 'route_id',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'point_index',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'type',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'instructions',
              description: "Vendor's name (could be a person or a company).",
              type: 'varchar',
            },
            {
              name: 'distance',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'duration',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
          ],
        },
        {
          name: 'segment_route',
          description: 'This table contains all vendors.',
          schemaColor: '#91C4F2',
          columns: [
            {
              name: 'id',
              description:
                'Unique identifier of a vendor. A vendor can have **credit** transactions with us (pay us money) and **debit** transactions (we pay money to a vendor).',
              type: 'bigint',
              handleType: 'source',
            },
            {
              name: 'segment_id',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'route_id',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
          ],
        },
        {
          name: 'core_section',
          description: 'This table contains all vendors.',
          schemaColor: '#91C4F2',
          columns: [
            {
              name: 'id',
              description:
                'Unique identifier of a vendor. A vendor can have **credit** transactions with us (pay us money) and **debit** transactions (we pay money to a vendor).',
              type: 'bigint',
              handleType: 'source',
            },
            {
              name: 'segment_id',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'route_id',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'name',
              description: "Vendor's name (could be a person or a company).",
              type: 'varchar',
            },
            {
              name: 'type',
              description: "Vendor's name (could be a person or a company).",
              type: 'varchar',
            },
          ],
        },
        {
          name: 'metadata',
          description: 'This table contains all vendors.',
          schemaColor: '#91C4F2',
          columns: [
            {
              name: 'table_name',
              description:
                'Unique identifier of a vendor. A vendor can have **credit** transactions with us (pay us money) and **debit** transactions (we pay money to a vendor).',
              type: 'varchar',
              handleType: 'source',
            },
            {
              name: 'version',
              description: "Vendor's name (could be a person or a company).",
              type: 'integer',
            },
            {
              name: 'updated_by',
              description: "Vendor's name (could be a person or a company).",
              type: 'varchar',
            },
          ],
        },
      ],
      tablePositions: {
        'schema.route': {
          x: 16,
          y: -80,
        },
        'schema.segment': {
          x: 288,
          y: -224,
        },
        'schema.section': {
          x: 288,
          y: 96,
        },
        'schema.point': {
          x: -208,
          y: 304,
        },
        'schema.congestion_code': {
          x: -208,
          y: 176,
        },
        'schema.guide_code': {
          x: 288,
          y: 400,
        },
        'schema.guide': {
          x: 16,
          y: 240,
        },
        'schema.segment_route': {
          x: -208,
          y: 32,
        },
        'schema.core_section': {
          x: -208,
          y: -288,
        },
        'schema.metadata': {
          x: -208,
          y: -112,
        },
      },
      edgeConfigs: [
        {
          source: 'schema.route',
          sourceKey: 'id',
          target: 'schema.section',
          targetKey: 'route_id',
          relation: 'hasMany',
        },
        {
          source: 'schema.route',
          sourceKey: 'id',
          target: 'schema.segment_route',
          targetKey: 'route_id',
          relation: 'hasMany',
        },
        {
          source: 'schema.segment',
          sourceKey: 'id',
          target: 'schema.segment_route',
          targetKey: 'segment_id',
          relation: 'hasMany',
        },
        {
          source: 'schema.segment',
          sourceKey: 'id',
          target: 'schema.core_section',
          targetKey: 'segment_id',
          relation: 'hasMany',
        },
        {
          source: 'schema.route',
          sourceKey: 'id',
          target: 'schema.core_section',
          targetKey: 'route_id',
          relation: 'hasMany',
        },
        {
          source: 'schema.route',
          sourceKey: 'id',
          target: 'schema.guide',
          targetKey: 'route_id',
          relation: 'hasMany',
        },
        {
          source: 'schema.congestion_code',
          sourceKey: 'code',
          target: 'schema.segment',
          targetKey: 'congestion',
          relation: 'hasMany',
        },
        {
          source: 'schema.guide_code',
          sourceKey: 'code',
          target: 'schema.guide',
          targetKey: 'type',
          relation: 'hasMany',
        },
        {
          source: 'schema.segment',
          sourceKey: 'id',
          target: 'schema.point',
          targetKey: 'segment_id',
          relation: 'hasMany',
        },
      ],
      schemaColors: {
        DEFAULT: '#91C4F2',
        public: '#91C4F2',
      },
    };
    return responseHelper(erd);
  }
}
