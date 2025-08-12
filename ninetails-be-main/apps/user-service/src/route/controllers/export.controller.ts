import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DownloadService } from 'libs/utils/download.service';
import { ExportReqDto } from '../dtos/export.dto';
import { DataSource } from 'typeorm';
import { Request, Response } from 'express';

@ApiTags('Export Route Management')
@Controller('/route-management')
@ApiBearerAuth()
export class ExportController {
  constructor(
    private downloadService: DownloadService,
    private dataSource: DataSource,
  ) {}

  @Post('/export')
  async exportRouteManagement(
    @Req() req: Request,
    @Body() body: ExportReqDto,
    @Res() res: Response,
  ) {
    const schema = req.headers.schema;
    const columns: { column_name: string }[] = await this.dataSource.query(
      `SELECT column_name from information_schema.columns where table_name = '${body.table}' 
      and table_schema = '${schema}';`,
    );
    const headers = columns
      .filter(
        (c) =>
          !['deleted_at', 'created_at', 'updated_at'].includes(c.column_name),
      )
      .map((h) => {
        if (h.column_name === 'pointIndex') {
          return `"${h.column_name}"`;
        }
        return h.column_name;
      });
    const datas = await this.dataSource.query(
      `select ${headers.join(',')} from "${schema}".${body.table} where deleted_at is null order by id asc;`,
    );
    if (body.type === 'csv') {
      this.downloadService.downloadCsv({ datas, res, filename: body.table });
    } else {
      this.downloadService.downloadXlsx({ datas, res, filename: body.table });
    }
    return;
  }
}
