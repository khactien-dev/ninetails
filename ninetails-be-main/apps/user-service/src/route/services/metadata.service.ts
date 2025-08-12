import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IPaginate } from 'libs/common/common.interface';
import { DataSource, Repository } from 'typeorm';
import { RevertDataService } from '../../revert-data/revert.service';
import { EOPERATOR } from 'libs/common/constants/common.constant';
import { MetadataEntity } from 'libs/entities/metadata.entity';
import {
  METADATACOLUMN,
  MetadataCreateDto,
  MetadataQueryDto,
  MetadataUpdateDto,
} from '../dtos/metadata.dto';

@Injectable()
export class MetadataService {
  constructor(
    @Inject('METADATA_REPO') private metadataEntity: Repository<MetadataEntity>,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private revertService: RevertDataService,
  ) {}

  async create(datas: MetadataCreateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const points = [];
      for (const data of datas) {
        const point = await manage.save(this.metadataEntity.create(data));
        await this.revertService.createWithTransaction(
          {
            table: 'metadata',
            new_data: point,
            old_data: null,
            type: 'insert',
          },
          manage,
        );
        points.push(point);
      }
      await queryRunner.commitTransaction();
      return points;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAndCount(criteria: MetadataQueryDto[], paginate: IPaginate) {
    let where = '';
    if (criteria?.length) {
      for (const obj of criteria) {
        const { column, operator } = obj;
        let { value } = obj;
        const logical = obj.logical || 'AND';
        if (
          [METADATACOLUMN.TABLE_NAME, METADATACOLUMN.UPDATED_BY].includes(
            column,
          ) &&
          typeof value !== 'string'
        ) {
          return { list: [], total: 0 };
        }
        if (column === METADATACOLUMN.VERSION) {
          if (isNaN(+value)) {
            return { list: [], total: 0 };
          } else {
            value = +value as any;
          }
        }
        if (operator === EOPERATOR.LIKE) {
          where +=
            (where ? ` ${logical} ` : '') +
            `${column} ${operator} '%${value}%'`;
        } else {
          if (
            operator === EOPERATOR.EQUALS &&
            ['table_name', 'updated_by'].includes(column)
          ) {
            where +=
              (where ? ` ${logical} ` : '') +
              `${column} ${operator} '${value}'`;
          } else {
            where +=
              (where ? ` ${logical} ` : '') + `${column} ${operator} ${value}`;
          }
        }
      }
    }
    const builder = this.metadataEntity.createQueryBuilder();
    if (where) builder.where(where);
    const [list, total] = await builder
      .take(paginate.take)
      .skip(paginate.skip)
      .orderBy(
        Object.keys(paginate.order)[0],
        Object.values(paginate.order)[0] as any,
      )
      .getManyAndCount();
    return { list, total };
  }

  async updateMany(datas: MetadataUpdateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const data of datas) {
        const updateId = data.updateId;
        delete data.updateId;
        const metadata = await manage.findOne(MetadataEntity, {
          where: { id: updateId },
          select: ['id', ...(Object.keys(data) as any)],
        });
        if (
          data.table_name !== metadata.table_name &&
          data.version !== metadata.version
        ) {
          const check = await manage.findOne(MetadataEntity, {
            where: {
              table_name: data.table_name,
              version: data.version,
            },
          });
          if (check) {
            throw new BadRequestException('Metadata is exists');
          }
        }
        if (data.table_name !== metadata.table_name) {
          const check = await manage.findOne(MetadataEntity, {
            where: {
              table_name: data.table_name,
              version: metadata.version,
            },
          });
          if (check) {
            throw new BadRequestException('Metadata is exists');
          }
        }
        if (data.version !== metadata.version) {
          const check = await manage.findOne(MetadataEntity, {
            where: {
              table_name: metadata.table_name,
              version: data.version,
            },
          });
          if (check) {
            throw new BadRequestException('Metadata is exists');
          }
        }
        if (!metadata) throw new BadRequestException('Metadata Not Found');
        await manage.update(MetadataEntity, { id: updateId }, data);
        await this.revertService.createWithTransaction(
          {
            table: 'metadata',
            new_data: data,
            old_data: metadata,
            type: 'update',
          },
          manage,
        );
      }
      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteMany(ids: number[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const id of ids) {
        const metadata = await manage.findOne(MetadataEntity, {
          where: { id },
        });
        if (!metadata) throw new BadRequestException('Meatadata Not Found');
        await manage.softDelete(MetadataEntity, { id });
        await this.revertService.createWithTransaction(
          {
            table: 'metadata',
            new_data: null,
            old_data: metadata,
            type: 'delete',
          },
          manage,
        );
      }
      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
