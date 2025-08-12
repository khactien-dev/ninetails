import { BadRequestException, Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { readFileSync, unlinkSync } from 'fs';
import { Parser } from 'xml2js';

@Injectable()
export class RouteImportService {
  private intHeaders: string[] = [
    'segment_id',
    'point_index',
    'code',
    'route_id',
    'point_index',
    'type',
    'distance',
    'duration',
    'version',
    'collect_count',
    'point_count',
    'congestion',
    'speed',
  ];
  handleFileDelimeter(file: Express.Multer.File, table?: string) {
    const data: string = readFileSync(file.destination + '/' + file.filename, {
      encoding: 'utf-8',
    });
    unlinkSync(file.destination + '/' + file.filename);
    const headers = data.split('\n')[0].split(',');
    return data
      .split('\n')
      .slice(1)
      .map((d, j) => {
        const res: any = {};
        const text = d.trim();
        if (!text) return;
        const val = d.split(',');
        for (let i = 0; i < headers.length; i++) {
          const key = headers[i].trim();
          const value = val[i];
          if (
            this.intHeaders.includes(key) &&
            isNaN(+value) &&
            table !== 'core_section'
          ) {
            throw new BadRequestException(
              `type of ${key}'s value at row ${j + 1} must be int`,
            );
          }
          res[headers[i].trim()] = value;
        }
        return res;
      })
      .filter((f) => f);
  }

  async handleFileXlsx(file: Express.Multer.File) {
    const workbook = new Workbook();
    await workbook.xlsx.readFile(file.destination + '/' + file.filename);
    const sheet = workbook.getWorksheet(1);
    unlinkSync(file.destination + '/' + file.filename);
    const result = [];
    let headers = [];
    sheet.eachRow((r, j) => {
      if (j === 1) {
        headers = (r.values as string[]).slice(1);
      } else {
        const res = {};
        for (let i = 0; i < headers.length; i++) {
          const key = headers[i].trim();
          const val = r.values[i + 1];
          if (this.intHeaders.includes(key) && isNaN(+val)) {
            throw new BadRequestException(
              `type of ${key}'s value at row ${j - 1} must be int`,
            );
          }
          res[key] = val;
        }
        result.push(res);
      }
    });
    return result;
  }

  handleFileXml(file: Express.Multer.File) {
    const data: string = readFileSync(file.destination + '/' + file.filename, {
      encoding: 'utf-8',
    });
    unlinkSync(file.destination + '/' + file.filename);
    const parser = new Parser();
    const results = [];
    parser.parseString(data, (err, res: { records: { record: object[] } }) => {
      if (err) throw new BadRequestException(err.message);
      const datas = res.records.record;
      for (let i = 0; i < datas.length; i++) {
        const data = datas[i];
        const save: object = {};
        for (const element in data) {
          const key = element.trim();
          const val = data[element][0];
          if (this.intHeaders.includes(key) && isNaN(+val)) {
            throw new BadRequestException(
              `type of ${key}'s value at data ${i + 1} must be int`,
            );
          }
          save[element.trim()] = val;
        }
        results.push(save);
      }
    });
    return results;
  }

  async handleImportFile(file: Express.Multer.File, table?: string) {
    let data = [];
    if (['text/csv', 'text/plain'].includes(file.mimetype)) {
      data = this.handleFileDelimeter(file, table);
    } else if (
      [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ].includes(file.mimetype)
    ) {
      data = await this.handleFileXlsx(file);
    } else if (file.mimetype === 'text/xml') {
      data = this.handleFileXml(file);
    } else {
      data = JSON.parse(
        readFileSync(file.destination + '/' + file.filename, {
          encoding: 'utf-8',
        }),
      );
      unlinkSync(file.destination + '/' + file.filename);
    }
    return data;
  }

  convertStringNArray(text: string, index: number, header: string) {
    const arr = [];
    const first = text.indexOf('"[');
    const last = text.indexOf(']"');
    if (first < 0 || !last) {
      throw new BadRequestException(
        `type of ${header}'s value at row ${index} must be narray of int`,
      );
    }
    let textArr = text.slice(first + 2, last);
    while (textArr) {
      const begin = textArr.indexOf('[');
      const end = textArr.indexOf(']');
      if (begin < 0 || !end) {
        throw new BadRequestException(
          `type of ${header}'s value at row ${index} must be narray of int`,
        );
      }
      arr.push(
        textArr
          .slice(begin + 1, end)
          .split(',')
          .map((t) => {
            if (isNaN(+t.trim())) {
              throw new BadRequestException(
                `type of ${header}'s value at row ${index} must be narray of int`,
              );
            }
            return +t.trim();
          }),
      );
      textArr = textArr.slice(end + 1, textArr.length);
    }
    return { arr, last };
  }

  convertStringArray(text: string, index: number, header: string) {
    const first = text.indexOf('"[');
    const last = text.indexOf(']"');
    if (first < 0 || !last) {
      throw new BadRequestException(
        `type of ${header}'s value at row ${index} must be array of int`,
      );
    }
    const textArr = text.slice(first + 2, last);
    const arr = textArr.split(',').map((t) => {
      if (isNaN(+t.trim())) {
        throw new BadRequestException(
          `type of ${header}'s value at row ${index} must be array of int`,
        );
      }
      return +t.trim();
    });
    return { arr, last };
  }

  handleFileDelimeterArrField(file: Express.Multer.File) {
    const data: string = readFileSync(file.destination + '/' + file.filename, {
      encoding: 'utf-8',
    });
    unlinkSync(file.destination + '/' + file.filename);
    const headers = data.split('\n')[0].split(',');
    return data
      .split('\n')
      .slice(1)
      .map((d, j) => {
        const res: any = {};
        let text = d.trim();
        if (!text) return;
        for (let i = 0; i < headers.length; i++) {
          const pos = text.indexOf(',');
          const header = headers[i].trim();
          if (['segment_line', 'path', 'bbox'].includes(header)) {
            const { arr, last } = this.convertStringNArray(text, j + 1, header);
            res[header] = arr;
            const textLength = text.slice(0, last + 3).length;
            text = text.slice(textLength);
          } else if (['start', 'goal'].includes(header)) {
            const { arr, last } = this.convertStringArray(text, j + 1, header);
            res[header] = arr;
            const textLength = text.slice(0, last + 3).length;
            text = text.slice(textLength);
          } else {
            const val = pos !== -1 ? text.slice(0, pos) : text;
            if (this.intHeaders.includes(header) && isNaN(+val)) {
              throw new BadRequestException(
                `type of ${header}'s value at row ${j + 1} must be int`,
              );
            }
            res[header] = val;
            text = pos !== -1 ? text.slice(pos + 1) : '';
          }
        }
        return res;
      })
      .filter((f) => f);
  }

  async handleFileXlsxArrField(file: Express.Multer.File) {
    const workbook = new Workbook();
    await workbook.xlsx.readFile(file.destination + '/' + file.filename);
    const sheet = workbook.getWorksheet(1);
    unlinkSync(file.destination + '/' + file.filename);
    const result = [];
    let headers: string[] = [];
    sheet.eachRow((r, j) => {
      if (j === 1) {
        headers = (r.values as string[]).slice(1);
      } else {
        const res = {};
        for (let i = 0; i < headers.length; i++) {
          const header = headers[i].trim();
          const text: string = r.values[i + 1];
          if (['segment_line', 'path', 'bbox'].includes(header)) {
            const { arr } = this.convertStringNArray(text, j - 1, header);
            res[header] = arr;
          } else if (['start', 'goal'].includes(header)) {
            const { arr } = this.convertStringArray(text, j - 1, header);
            res[header] = arr;
          } else {
            const val = r.values[i + 1];
            if (this.intHeaders.includes(header) && isNaN(+val)) {
              throw new BadRequestException(
                `type of ${header}'s value at row ${j - 1} must be int`,
              );
            }
            res[header] = val;
          }
        }
        result.push(res);
      }
    });
    return result;
  }

  handleFileXmlArrField(file: Express.Multer.File) {
    const data: string = readFileSync(file.destination + '/' + file.filename, {
      encoding: 'utf-8',
    });
    unlinkSync(file.destination + '/' + file.filename);
    const parser = new Parser();
    const results = [];
    parser.parseString(data, (err, res: { records: { record: object[] } }) => {
      if (err) throw new BadRequestException(err.message);
      const datas = res.records.record;
      for (let i = 0; i < datas.length; i++) {
        const data = datas[i];
        const save: object = {};
        for (const element in data) {
          const header = element.trim();
          const value = data[element][0];
          if (['segment_line', 'path', 'bbox'].includes(header)) {
            const { arr } = this.convertStringNArray(value, i + 1, header);
            save[header] = arr;
          } else if (['start', 'goal'].includes(header)) {
            const { arr } = this.convertStringArray(value, i + 1, header);
            res[header] = arr;
          } else {
            const val = data[element][0];
            if (this.intHeaders.includes(header) && isNaN(+val)) {
              throw new BadRequestException(
                `type of ${header}'s value at data ${i + 1} must be int`,
              );
            }
            save[header] = val;
          }
        }
        results.push(save);
      }
    });
    return results;
  }

  async handleImportFileArrField(file: Express.Multer.File) {
    let data = [];
    if (['text/csv', 'text/plain'].includes(file.mimetype)) {
      data = this.handleFileDelimeterArrField(file);
    } else if (
      [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ].includes(file.mimetype)
    ) {
      data = await this.handleFileXlsxArrField(file);
    } else if (file.mimetype === 'text/xml') {
      data = this.handleFileXmlArrField(file);
    } else {
      data = JSON.parse(
        readFileSync(file.destination + '/' + file.filename, {
          encoding: 'utf-8',
        }),
      );
      unlinkSync(file.destination + '/' + file.filename);
    }
    return data;
  }
}
