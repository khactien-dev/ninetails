import { Body, Controller, Post, Request, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DiaryService } from '../services/diary.service';
import { DiaryListRes, DiaryQueryDto, ExportReqDiary } from '../dtos/diary.dto';
import { handlePaginate, responseHelper } from 'libs/utils/helper.util';
import { NUMBER_PAGE, SORTBY } from 'libs/common/constants/common.constant';
import { DownloadService } from 'libs/utils/download.service';
import { Response } from 'express';

@Controller('driving-diary')
@ApiTags('Driving Diary')
@ApiBearerAuth()
export class DiaryController {
  constructor(
    private diaryService: DiaryService,
    private downloadService: DownloadService,
  ) {}

  @Post('data-table')
  @ApiOkResponse({ type: DiaryListRes })
  @ApiOperation({ summary: 'list driving diary data table' })
  async dataTable(
    @Request()
    req: {
      auth: { tenant: string; tenant_id: number };
      headers: { schema: string };
    },
    @Body() body: DiaryQueryDto,
  ) {
    // const schema = 'gs012';
    const schema = req.headers?.schema;
    if (!body.sortBy) body.sortBy = SORTBY.ASC;
    if (!body.page) body.page = 1;
    if (!body.pageSize) body.pageSize = 10;
    if (!body.sortField) body.sortField = 'data.timestamp';
    const handlePage = handlePaginate(body);
    body.schema = schema;
    body.tenant_id = req.auth.tenant_id;
    const {
      diaries,
      total,
      total_collect_amount,
      total_trip_distance,
      total_weight,
      totalDuration,
    } = await this.diaryService.getDataFix(body);
    return responseHelper({
      data: diaries,
      total: {
        total_collect_amount,
        total_trip_distance,
        total_weight,
        totalDuration,
      },
      pagination: {
        total,
        last_page: Math.ceil(total / +handlePage.take),
        per_page: +handlePage.take,
        current_page: body.page || NUMBER_PAGE.PAGE,
      },
    });
  }

  @Post('export')
  @ApiOperation({ summary: 'export' })
  async exportDiary(
    @Request()
    req: {
      auth: { tenant: string; tenant_id: number };
      headers: { schema: string };
    },
    @Body() body: ExportReqDiary,
    @Res() res: Response,
  ) {
    const schema = req.headers?.schema;
    const param = {
      schema,
      tenant_id: req.auth.tenant_id,
      routeId: body.routeId,
      page: 1,
      pageSize: 10000,
      sortBy: SORTBY.ASC.toLowerCase() as any,
      sortField: 'data.timestamp',
      date: body.date,
    };
    const {
      diaries,
      total_collect_amount,
      total_trip_distance,
      total_weight,
      totalDuration,
    } = await this.diaryService.getDataFix(param);
    if (!diaries.length) {
      diaries[0] = {
        번호: null,
        구간명: null,
        주행모드: null,
        진입: null,
        '기간 min': null,
        '거리 m': null,
        수거량: null,
        '중량 kg': null,
      };
    }
    let ind = 0;
    const datas = diaries.map((d) => {
      ind++;
      return {
        번호: ind,
        구간명: d.section_name,
        주행모드: d.drive_mode,
        진입: d.timestamp,
        '기간 min': d.duration,
        '거리 m': d.total_trip_distance,
        수거량: d.collect_amount,
        '중량 kg': d.weight,
      };
    });
    datas.unshift({
      번호: '합계' as any,
      구간명: '',
      주행모드: '',
      진입: '',
      '기간 min': totalDuration,
      '거리 m': total_trip_distance,
      수거량: total_collect_amount,
      '중량 kg': total_weight,
    });
    if (body.type === 'csv') {
      this.downloadService.downloadCsv({
        datas,
        res,
        filename: 'driving-diary',
      });
    } else {
      this.downloadService.downloadXlsx({
        datas,
        res,
        filename: 'driving-diary',
      });
    }
  }
}
