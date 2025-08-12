import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { TenantEntity } from 'libs/entities/tenant.entity';
import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { FileService } from '../file/file.service';
import * as moment from 'moment';
import * as AdmZip from 'adm-zip';
import { Client } from '@opensearch-project/opensearch';
import { IOpenSearchResult } from 'libs/common/constants/common.constant';
import { ContractEntity } from 'libs/entities/contract.entity';
import { BackupEntity } from 'libs/entities/backup.entity';

@Injectable()
export class BackupService {
  constructor(
    @InjectRepository(TenantEntity)
    private tenantEntity: Repository<TenantEntity>,
    @InjectRepository(ContractEntity)
    private contractEntity: Repository<ContractEntity>,
    private mailService: MailService,
    private dataSource: DataSource,
    private fileService: FileService,
    @Inject('OpenSearchClient') private openSearchClient: Client,
    @InjectRepository(BackupEntity)
    private backupEntity: Repository<BackupEntity>,
  ) {}

  @Cron('0 0 * * *')
  async remindBackup() {
    const flagDate = moment()
      .startOf('day')
      .add(6, 'day')
      .format('YYYY-MM-DD 23:59:59.999');
    const current = moment().format('YYYY-MM-DD HH:mm:ss');

    const tenants = await this.tenantEntity
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.contracts', 'c')
      .where(
        `c.end_date::timestamp <= '${flagDate}'::timestamp and c.status = 1 and is_remind = false 
        and c.end_date::timestamp > '${current}'::timestamp and c.start_date::timestamp <= '${current}'::timestamp`,
      )
      .getMany();

    for (const tenant of tenants) {
      const endDate = moment()
        .startOf('day')
        .add(6, 'day')
        .format('YYYY-MM-DD 23:59:59');
      this.mailService.sendRemindBackup({
        email: tenant.email,
        link: process.env.APP_URL,
        endDate,
        operator: tenant.operator,
      });
      this.contractEntity.update({ tenant_id: tenant.id }, { is_remind: true });
    }
    return tenants;
  }

  async writeAndZip(
    tenant: TenantEntity,
    zip: AdmZip,
    flagDate: string,
    byEndDate?: boolean,
  ) {
    const tables: { table_name: string }[] = await this.dataSource.query(
      `select * from information_schema.tables where table_schema = '${tenant.schema}';`,
    );
    const reachDate = moment().startOf('day').format('YYYY-MM-DD 00:00:00');
    for (const table of tables) {
      if (table.table_name === 'storage_data') continue;
      const list: any[] = byEndDate
        ? await this.dataSource.query(
            `SELECT * FROM "${tenant.schema}".${table.table_name};`,
          )
        : await this.dataSource.query(
            `SELECT * FROM "${tenant.schema}".${table.table_name} where created_at::timestamp >= '${flagDate}'::timestamp
            and created_at::timestamp < '${reachDate}'::timestamp;`,
          );

      if (list.length < 1) continue;
      const columns: { column_name: string }[] = await this.dataSource.query(
        `SELECT column_name from information_schema.columns where table_name = '${table.table_name}' 
        and table_schema = '${tenant.schema}';`,
      );
      const headers = columns.reduce((p, c, i) => {
        if (i === 0) {
          return p + c.column_name;
        }
        return p + ',' + c.column_name;
      }, '');

      const dataCSV = list.reduce((p: string, c) => {
        p += Object.keys(c).reduce((prev, curr, i) => {
          if (i === 0) {
            return prev + `${c[curr]}`;
          }
          return prev + `,"${c[curr]}"`;
        }, '\n');
        return p;
      }, headers);

      writeFileSync(
        `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}_${table.table_name}.csv`,
        dataCSV,
        'utf8',
      );
      zip.addLocalFile(
        `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}_${table.table_name}.csv`,
      );
    }
    const indexNames = [
      'drive_metrics',
      'vehicle_route',
      'vehicle_info',
      'edge_state_metrics',
      'collect_metrics',
      'illegal_discharges',
      'zscore_rollup',
    ];
    const current = moment();
    const size = 1000;
    for (const index of indexNames) {
      let i = 12;
      mkdirSync(
        `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}_${index}`,
        { recursive: true },
      );
      while (i > 0) {
        const start = moment(current)
          .subtract(i, 'months')
          .add(1, 'millisecond');
        const end = moment(current).subtract(i - 1, 'months');
        let result: IOpenSearchResult;
        const queryBody = {
          query: {
            bool: {
              filter: [
                {
                  match_all: {},
                },
                {
                  range: {
                    'data.timestamp': {
                      gte: start.format('YYYY-MM-DDTHH:mm:ss.SSS'),
                      lte: end.format('YYYY-MM-DDTHH:mm:ss.SSS'),
                      format: 'strict_date_optional_time',
                    },
                  },
                },
              ],
            },
          },
          size,
          from: 0,
        };
        try {
          result = await this.openSearchClient.search({
            index: `${tenant.schema}.${index}`,
            body: queryBody,
          });
        } catch (error) {
          i -= 1;
          continue;
        }
        const hits = result.body.hits.hits;
        if (hits.length < 1) {
          i -= 1;
          continue;
        }
        const headers = Object.keys(hits[0]._source.data).reduce((p, c, i) => {
          if (i === 0) {
            return p + c;
          }
          return p + ',' + c;
        }, '');
        const dataCSV = hits.reduce((p: string, c) => {
          const data = c._source.data;
          p += Object.keys(data).reduce((prev, curr, i) => {
            if (i === 0) {
              if (['latest', 'mean', 'standardDeviation'].includes(curr)) {
                return prev + `"${JSON.stringify(data[curr])}"`;
              }
              return prev + `${data[curr]}`;
            }
            if (curr === 'coordinates' && data[curr].length) {
              let next = '';
              data[curr].map((c) => {
                if (next) {
                  next += `;${c}`;
                } else {
                  next += c;
                }
                return c;
              });
              return prev + `,"${next}"`;
            }
            if (['latest', 'mean', 'standardDeviation'].includes(curr)) {
              return prev + `,"${JSON.stringify(data[curr])}"`;
            }
            return prev + `,"${data[curr]}"`;
          }, '\n');
          return p;
        }, headers);
        const filename = `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}_${index}/${tenant.schema}_${index}_${start.format(
          'YYYY-MM-DD',
        )}_${end.subtract(1, 'day').format('YYYY-MM-DD')}.csv`;
        writeFileSync(filename, dataCSV, 'utf-8');
        const total = result.body.hits.total.value;
        if (total > size) {
          let from = size;
          do {
            queryBody.from = from;
            result = await this.openSearchClient.search({
              index: `${tenant.schema}.${index}`,
              body: queryBody,
            });
            const appendHits = result.body.hits.hits;
            const dataAppend = appendHits.reduce((p: string, c) => {
              const data = c._source.data;
              p += Object.keys(data).reduce((prev, curr, i) => {
                if (i === 0) {
                  return prev + `${data[curr]}`;
                }
                return prev + `,${data[curr]}`;
              }, '\n');
              return p;
            }, '');
            appendFileSync(filename, dataAppend, 'utf-8');
            if (total - from <= 0) {
              from += 1;
              continue;
            }
            if (total - from < size) {
              from += total - from;
            } else {
              from += size;
            }
          } while (total >= from);
        }
        zip.addLocalFile(filename, `${tenant.schema}_${index}/`);
        i -= 1;
      }
    }
    zip.writeZip(
      `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}.zip`,
    );
    const fileZip = readFileSync(
      `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}.zip`,
      null,
    );
    const optFile = {
      buffer: fileZip,
      originalname: `${tenant.schema}`,
      mimetype: 'zip',
    } as any;
    const uploaded = await this.fileService.uploadSingleFile({
      file: optFile,
      isPublic: true,
    });
    for (const index of indexNames) {
      try {
        rmSync(
          `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}_${index}`,
          { recursive: true, force: true },
        );
      } catch (error) {}
    }
    for (const table of tables) {
      try {
        unlinkSync(
          `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}_${table.table_name}.csv`,
        );
      } catch (error) {}
    }
    unlinkSync(
      `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}.zip`,
    );
    return uploaded;
  }

  @Cron('0 0 * * *')
  async backupDataByEndDate() {
    const flagDate = moment()
      .startOf('day')
      .subtract(1, 'day')
      .format('YYYY-MM-DD 23:59:59.999');

    const tenants = await this.tenantEntity
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.contracts', 'c')
      .where(
        `c.end_date::timestamp = '${flagDate}'::timestamp and c.status = 1`,
      )
      .getMany();
    const url = [];
    for (const tenant of tenants) {
      const zip = new AdmZip();
      const uploaded = await this.writeAndZip(tenant, zip, flagDate, true);
      url.push(uploaded);
      if (tenant.is_backup) {
        this.mailService.sendBackupUrl({
          email: tenant.email,
          link: uploaded.url,
          endDate: moment(tenant.contracts[0].end_date).format(
            'YYYY-MM-DD HH:mm:ss',
          ),
          startDate: moment(tenant.contracts[0].start_date).format(
            'YYYY-MM-DD HH:mm:ss',
          ),
          operator: tenant.operator,
        });
      }
      this.backupEntity.save(
        this.backupEntity.create({
          tenant_id: tenant.id,
          url: uploaded.url,
          createdAt: moment().format('YYYY-MM-DD 00:00:00'),
        }),
      );
    }
    return url;
  }

  @Cron('0 0 * * *')
  async backupDataPerYear() {
    const flagDate = moment()
      .startOf('day')
      .subtract(1, 'year')
      .format('YYYY-MM-DD 00:00:00');

    const tenants = await this.tenantEntity
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.contracts', 'c')
      .where(
        `c.start_date::timestamp = '${flagDate}'::timestamp and c.status = 1`,
      )
      .getMany();
    const url = [];
    for (const tenant of tenants) {
      const zip = new AdmZip();
      const uploaded = await this.writeAndZip(tenant, zip, flagDate);
      url.push(uploaded);
    }
    return url;
  }

  async backupDataByCopy() {
    const flagDate = moment()
      .startOf('day')
      .subtract(1, 'day')
      .format('YYYY-MM-DD 23:59:59.999');

    const tenants = await this.tenantEntity
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.contracts', 'c')
      .where(
        `c.end_date::timestamp = '${flagDate}'::timestamp and c.status = 1`,
      )
      .getMany();

    for (const tenant of tenants) {
      const tables: { table_name: string }[] = await this.dataSource.query(
        `select * from information_schema.tables where table_schema = '${tenant.schema}';`,
      );
      const zip = new AdmZip();
      for (const table of tables) {
        await this.dataSource.query(
          `copy (SELECT * FROM "${tenant.schema}".${table.table_name}) 
          to '${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}_${table.table_name}.csv' WITH CSV HEADER;`,
        );
        zip.addLocalFile(
          `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}_${table.table_name}.csv`,
        );
      }
      zip.writeZip(
        `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}.zip`,
      );
      const fileZip = readFileSync(
        `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}.zip`,
        null,
      );
      const optFile = {
        buffer: fileZip,
        originalname: `${tenant.schema}`,
        mimetype: 'zip',
      } as any;
      const uploaded = await this.fileService.uploadSingleFile({
        file: optFile,
        isPublic: true,
      });
      if (tenant.is_backup) {
        this.mailService.sendBackupUrl({
          email: tenant.email,
          link: uploaded.url,
          endDate: tenant.contracts[0].end_date.toString(),
          startDate: tenant.contracts[0].start_date.toString(),
          operator: tenant.operator,
        });
      }
      for (const table of tables) {
        unlinkSync(
          `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}_${table.table_name}.csv`,
        );
      }
      unlinkSync(
        `${process.env.UPLOADED_FILES_DESTINATION}/${tenant.schema}.zip`,
      );
    }
    return;
  }
}
