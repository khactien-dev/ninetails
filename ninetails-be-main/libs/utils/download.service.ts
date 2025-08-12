import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { Response } from 'express';
import { parse } from 'json2csv';

@Injectable()
export class DownloadService {
  async downloadXlsx(params: {
    datas: any[];
    res: Response;
    filename: string;
  }) {
    const { datas, res } = params;
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Data');
    worksheet.columns = Object.keys(datas[0]).map((d) => ({
      header: d,
      key: d,
    }));
    worksheet.addRows(datas);
    for (let i = 1; i <= datas.length; i++) {
      worksheet.getRow(i).eachCell({ includeEmpty: true }, (c) => {
        c.alignment = { wrapText: true };
      });
    }
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + `${params.filename}.xlsx`,
    );
    await workbook.xlsx.write(res);
    return res.status(200).send();
  }

  downloadCsv(params: { datas: any[]; res: Response; filename: string }) {
    const { datas, res } = params;
    const csv = parse(datas);
    res.setHeader(
      'Content-disposition',
      `attachment; filename=${params.filename}.csv`,
    );
    res.set('Content-Type', 'text/csv');
    return res.status(200).send(csv);
  }
}
