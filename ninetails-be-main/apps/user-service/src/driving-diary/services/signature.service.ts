import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SignatureEntity } from 'libs/entities/signature.entity';
import { DataSource, Repository } from 'typeorm';
import { SignatureCreateDto } from '../dtos/signature.dto';
import { SignHistoryEntity } from 'libs/entities/sign-history.entity';
import * as moment from 'moment';
import { EUserRole } from 'libs/enums/common.enum';
import { UserEntity } from 'libs/entities/user.entity';
import { FileService } from 'libs/utils/file.service';

@Injectable()
export class SignatureService {
  constructor(
    @Inject('SIGNATURE_REPO')
    private signatureRepository: Repository<SignatureEntity>,
    @Inject('SIGN_HISTORY_REPO')
    private signHisRepository: Repository<SignHistoryEntity>,
    @Inject('USER_REPO') private userRepository: Repository<UserEntity>,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private readonly fileService: FileService,
  ) {}

  async save(data: SignatureCreateDto, schema) {
    const check = await this.findOneByUser(data.master_id);
    if (!check) {
      const insert = await this.dataSource.query(
        `INSERT INTO "${schema}"."signature" (master_id, url) 
        VALUES (${data.master_id},PGP_SYM_ENCRYPT('${data.url}','${process.env.ENCRYPT_KEY}')) returning id;`,
      );
      const { entities, raw } = await this.signatureRepository
        .createQueryBuilder('s')
        .addSelect(
          `PGP_SYM_DECRYPT(s.url::bytea, '${process.env.ENCRYPT_KEY}')`,
          'url',
        )
        .where(`id = ${+insert[0].id}`)
        .getRawAndEntities();
      const signature = entities[0];
      signature.url = (
        await this.fileService.getPresignedSignedUrl(raw[0].url)
      ).url;
      return signature;
    }
    await this.dataSource.query(
      `update "${schema}"."signature" set url = PGP_SYM_ENCRYPT('${data.url}','${process.env.ENCRYPT_KEY}') 
      where id = ${check.id}`,
    );
    // await this.signatureRepository.update({ id: check.id }, data);
    return await this.findOneByUser(check.master_id);
  }

  async findOneByUser(masterId: number) {
    const { entities, raw } = await this.signatureRepository
      .createQueryBuilder('s')
      .addSelect(
        `PGP_SYM_DECRYPT(s.url::bytea, '${process.env.ENCRYPT_KEY}')`,
        'url',
      )
      .where(`s.master_id = ${masterId}`)
      .getRawAndEntities();
    if (raw.length < 1) return null;
    const signature = entities[0];
    signature.url = (
      await this.fileService.getPresignedSignedUrl(raw[0].url)
    ).url;
    return signature;
  }

  async sign(masterId: number, vehicleId: number) {
    const signature = await this.signatureRepository.findOne({
      where: { master_id: masterId },
    });
    if (!signature) throw new BadRequestException('Signature Not Found');
    const user = await this.userRepository.findOneBy({ master_id: masterId });
    const signed = await this.getSigned({ date: new Date(), vehicleId });
    const saveData: {
      op_master_id?: number;
      dispatch_master_id?: number;
      op_master_url?: string;
      dispatch_master_url?: string;
      vehicle_id?: number;
      date?: string;
    } = {};
    if (user.role === EUserRole.OP || user.role === EUserRole.BACKUP) {
      saveData.op_master_id = signature.master_id;
      saveData.op_master_url = signature.url;
    } else {
      saveData.dispatch_master_id = signature.master_id;
      saveData.dispatch_master_url = signature.url;
    }
    if (signed) {
      await this.signHisRepository.update({ id: signed.id }, saveData);
      return await this.getSigned({ date: new Date() });
    }
    saveData.vehicle_id = vehicleId;
    saveData.date = moment().startOf('day').format('YYYY-MM-DD 00:00:00');
    return await this.signHisRepository.save(
      this.signHisRepository.create(saveData),
    );
  }

  async getSigned(criteria: {
    id?: number;
    date?: Date;
    user?: { master_id: number; role: EUserRole };
    vehicleId?: number;
  }) {
    let whereStr = '';
    const { id, date, user, vehicleId } = criteria;
    if (date) {
      const whereDate = moment(date)
        .startOf('day')
        .format('YYYY-MM-DD 00:00:00') as any;
      whereStr += `s.date = '${whereDate}'::timestamp`;
    }
    if (id) {
      whereStr += (whereStr ? ' and ' : '') + `s.id = ${id}`;
    }
    if (vehicleId) {
      whereStr += (whereStr ? ' and ' : '') + `s.vehicle_id = ${vehicleId}`;
    }
    if (user) {
      if (user.role === EUserRole.OP || user.role === EUserRole.BACKUP) {
        whereStr +=
          (whereStr ? ' and ' : '') + `s.op_master_id = ${user.master_id}`;
      } else {
        whereStr +=
          (whereStr ? ' and ' : '') +
          `s.dispatch_master_id = ${user.master_id}`;
      }
    }
    const { entities, raw } = await this.signHisRepository
      .createQueryBuilder('s')
      .addSelect(
        `PGP_SYM_DECRYPT(s.op_master_url::bytea, '${process.env.ENCRYPT_KEY}')`,
        'op_master_url',
      )
      .addSelect(
        `PGP_SYM_DECRYPT(s.dispatch_master_url::bytea, '${process.env.ENCRYPT_KEY}')`,
        'dispatch_master_url',
      )
      .where(whereStr)
      .getRawAndEntities();
    const history = entities[0];
    if (history?.op_master_url) {
      history.op_master_url = (
        await this.fileService.getPresignedSignedUrl(raw[0].op_master_url)
      ).url;
    }
    if (history?.dispatch_master_url) {
      history.dispatch_master_url = (
        await this.fileService.getPresignedSignedUrl(raw[0].dispatch_master_url)
      ).url;
    }
    return history || null;
  }

  async delSigned(role: EUserRole, vehicleId: number) {
    const signed = await this.getSigned({
      date: new Date(),
      vehicleId,
    });
    if (!signed) throw new BadRequestException('Signed Not Found');
    if (
      role === EUserRole.OP ||
      role === EUserRole.BACKUP ||
      role === EUserRole.ADMIN
    ) {
      return await this.signHisRepository.update(
        { id: signed.id },
        {
          op_master_id: null,
          op_master_url: null,
        },
      );
    } else {
      return await this.signHisRepository.update(
        { id: signed.id },
        { dispatch_master_id: null },
      );
    }
  }
}
