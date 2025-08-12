import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantEntity } from 'libs/entities/tenant.entity';
import {
  DataSource,
  DeepPartial,
  EntityManager,
  IsNull,
  Repository,
} from 'typeorm';
import { TenantCreateDto, TenantUpdateDto } from './dto/tenant-req.dto';
import { UserMasterService } from '../user-master/user-master.service';
import {
  EUserRole,
  PERMISSION_TYPE,
  PERMISSION,
  FULL,
  RX,
  CRUD,
  RUX,
  RU,
} from 'libs/enums/common.enum';
import {
  approvedIndex,
  createSchema,
  randomPassword,
} from 'libs/utils/helper.util';
import { ESTATUS, UserStatus } from 'libs/common/constants/common.constant';
import { ContractEntity } from 'libs/entities/contract.entity';
import { MailService } from '../mail/mail.service';
import { Cron } from '@nestjs/schedule';
import { StaffEntity } from 'libs/entities/staff.entity';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import { UserEntity } from 'libs/entities/user.entity';
import { ComboBoxEntity } from 'libs/entities/combo-box.entity';
import { SettingNotificationEntity } from 'libs/entities/setting-notification.entity';
import { NotificationEntity } from 'libs/entities/notification.entity';
import * as moment from 'moment';
import { EdgeServeEntity } from 'libs/entities/edge-serve.entity';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import * as rabbit from 'rabbitmq-stream-js-client';
import { ConfigService } from '@nestjs/config';
import { RouteEntity } from 'libs/entities/route.entity';
import { CongestionCodeEntity } from 'libs/entities/congestion-code.entity';
import { CoreSectionEntity } from 'libs/entities/core-section.entity';
import { GuideCodeEntity } from 'libs/entities/guide-code.entity';
import { GuideEntity } from 'libs/entities/guide.entity';
import { SectionEntity } from 'libs/entities/section.entity';
import { SegmentRouteMapEntity } from 'libs/entities/segment-route-map.entity';
import { SegmentEntity } from 'libs/entities/segment.entity';
import { PointEntity } from 'libs/entities/point.entity';
import { MetadataEntity } from 'libs/entities/metadata.entity';
import { StorageDataEntity } from 'libs/entities/storage-data.entity';
import { AbsenceStaffEntity } from 'libs/entities/absence-staff.entity';
import { AbsenceVehicleEntity } from 'libs/entities/absence-vehicle.entity';
import { connect } from 'amqp-connection-manager';
import * as amqp from 'amqplib/callback_api';
import axios from 'axios';
import { PermissionEntity } from 'libs/entities/permission.entity';
import { SignatureEntity } from 'libs/entities/signature.entity';
import { SignHistoryEntity } from 'libs/entities/sign-history.entity';
import { DrivingDiaryEntity } from 'libs/entities/driving-diary.entity';
import { DrivingRecordEntity } from 'libs/entities/driving-record.entity';
import { MetricWeightEntity } from 'libs/entities/metric-weight.entity';
import { EncryptDataService } from 'libs/utils/encrypt-data';
import { LandfillRecordEntity } from 'libs/entities/landfill-record.entity';
import { ConfigWeightEntity } from 'libs/entities/config-weight.entity';
import { EdgeState1DayEntity, EdgeState1HourEntity, EdgeStateRawEntity } from 'libs/entities/edge-state.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(TenantEntity)
    private tenantEntity: Repository<TenantEntity>,
    private dataSource: DataSource,
    private userMasterService: UserMasterService,
    @InjectRepository(ContractEntity)
    private contractEntity: Repository<ContractEntity>,
    private mailService: MailService,
    private configService: ConfigService,
    private encryptService: EncryptDataService,
  ) {}

  async create(data: TenantCreateDto) {
    const checkEmail = await this.tenantEntity.findOne({
      where: { email: data.email },
    });
    const checkUser = await this.userMasterService.findOne(
      {
        email: data.email,
      },
      false,
    );
    if (checkEmail || checkUser) {
      throw new BadRequestException(
        // 'This email is already taken. Please use a different one.',
        '이 이메일은 이미 사용 중입니다. 다른 이메일을 사용해 주세요.',
      );
    }
    const checkPhone = await this.encryptService.findByPgcrypto(
      'public',
      'users_master',
      'phone_number',
      data.phone,
    );
    if (checkPhone) {
      throw new BadRequestException(
        // 'This phone number is already taken. Please use a different one.',
        '이 전화번호는 이미 사용 중입니다. 다른 전화번호를 사용하세요.',
      );
    }
    data.organization = data.organization.trim();
    const digits = 'abcdefghABCDEFGH0123456789';
    let token = '';
    let checkToken = false;
    while (checkToken === false) {
      for (let i = 0; i < 60; i++) {
        token += digits[Math.floor(Math.random() * digits.length)];
      }
      const code = await this.tenantEntity.findOne({
        where: { token },
      });
      if (code) {
        token = '';
      } else {
        checkToken = true;
      }
    }
    // return await this.tenantEntity.save(this.tenantEntity.create(data));
    const insert = await this.dataSource.query(
      `insert into public.tenant 
      (organization, department, operator, position, email, phone, proof1, filename_proof1, proof2, filename_proof2, token)
      values ('${data.organization}',PGP_SYM_ENCRYPT('${data.department}','${this.configService.get('ENCRYPT_KEY')}'),
      PGP_SYM_ENCRYPT('${data.operator}','${this.configService.get('ENCRYPT_KEY')}'),
      PGP_SYM_ENCRYPT('${data.position}','${this.configService.get('ENCRYPT_KEY')}'),
      '${data.email}',PGP_SYM_ENCRYPT('${data.phone}','${this.configService.get('ENCRYPT_KEY')}'),
      ${data.proof1 ? `'${data.proof1}'` : null},${data.filename_proof1 ? `'${data.filename_proof1}'` : null},
      ${data.proof2 ? `'${data.proof2}'` : null}, ${data.filename_proof2 ? `'${data.filename_proof2}'` : null},'${token}') 
      RETURNING id`,
    );
    const raw = await this.tenantEntity
      .createQueryBuilder('t')
      .addSelect(
        `PGP_SYM_DECRYPT(t.operator::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'operator',
      )
      .where(`id = ${insert[0].id}`)
      .getRawOne();

    return {
      id: raw.t_id,
      email: raw.t_email,
      organization: raw.t_organization,
      operator: raw.operator,
      token: raw.t_token,
    };
  }

  async findOne(
    criteria: { email?: string; id?: number; token?: string; phone?: string },
    getRaw = false,
  ) {
    // const tenant = await this.tenantEntity.findOne({
    //   where: criteria,
    // });
    let whereStr = '';
    for (const item in criteria) {
      if (item === 'id') {
        whereStr += (whereStr ? ' AND ' : '') + `id = ${criteria[item]}`;
      } else if (['email', 'phone'].includes(item)) {
        whereStr +=
          (whereStr ? ' AND ' : '') +
          `PGP_SYM_DECRYPT(t.${item}::bytea, '${this.configService.get('ENCRYPT_KEY')}') = '${criteria[item]}'`;
      } else {
        whereStr += (whereStr ? ' AND ' : '') + `${item} = '${criteria[item]}'`;
      }
    }
    const raw = await this.tenantEntity
      .createQueryBuilder('t')
      .addSelect(
        `PGP_SYM_DECRYPT(t.operator::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'operator',
      )
      .addSelect(
        `PGP_SYM_DECRYPT(t.phone::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'phone',
      )
      .where(whereStr)
      .getRawOne();

    if (!raw) throw new NotFoundException('Tenant Not Found');
    const tenant = {
      id: raw.t_id,
      email: raw.t_email,
      organization: raw.t_organization,
      operator: raw.operator,
      token: raw.t_token,
      phone: raw.phone,
      send_mail_at: raw.t_send_mail_at,
      schema: raw.t_schema,
      approved_time: raw.t_approved_time,
      proof1: raw.t_proof1,
      proof2: raw.t_proof2,
      filename_proof1: raw.t_filename_proof1,
      filename_proof2: raw.t_filename_proof2,
      rawEmail: undefined,
      rawPhone: undefined,
    };
    if (getRaw) {
      tenant.rawPhone = raw.t_phone;
    }
    return tenant;
  }

  async findOneWithContract(criteria: { id?: number; schema?: string }) {
    const query = this.tenantEntity
      .createQueryBuilder('t')
      .addSelect(
        `PGP_SYM_DECRYPT(t.phone::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'phone',
      )
      .addSelect(
        `PGP_SYM_DECRYPT(t.operator::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'operator',
      )
      .addSelect(
        `PGP_SYM_DECRYPT(c.start_date::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'start_date',
      )
      .addSelect(
        `PGP_SYM_DECRYPT(c.end_date::bytea, '${this.configService.get('ENCRYPT_KEY')}')::timestamp`,
        'end_date',
      )
      .addSelect(
        `PGP_SYM_DECRYPT(c.type::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'type',
      )
      .leftJoinAndSelect('t.contracts', 'c')
      .orderBy('t.id', 'DESC')
      .limit(1);

    if (criteria.schema) {
      query.where(`t.schema = '${criteria.schema}'`);
    } else {
      query.where(`t.id = ${criteria.id}`);
    }
    const { entities, raw } = await query.getRawAndEntities();
    if (!raw) throw new NotFoundException('Tenant Not Found');
    const tenant = entities[0];
    tenant.phone = raw[0].phone;
    tenant.operator = raw[0].operator;
    if (tenant.contracts.length > 0) {
      tenant.contracts[0].start_date = raw[0].start_date;
      tenant.contracts[0].end_date = raw[0].end_date;
      tenant.contracts[0].type = raw[0].type;
    }

    const department =
      !isNaN(Number(tenant.department)) && tenant.schema !== null
        ? await this.findSchemaComboboxById(
            tenant.schema,
            parseInt(tenant.department, 10),
          )
        : tenant.department;

    const position =
      !isNaN(Number(tenant.position)) && tenant.schema !== null
        ? await this.findSchemaComboboxById(
            tenant.schema,
            parseInt(tenant.position, 10),
          )
        : tenant.position;

    const formattedContracts = tenant.contracts.map((contract) => ({
      ...contract,
      start_date: moment(contract.start_date).utc().format('YYYY-MM-DD'),
      end_date: moment(contract.end_date).utc().format('YYYY-MM-DD'),
    }));

    let logo: { image: any; name: any };
    const defaultLogo = {
      image: process.env.ASSET_URL + '/default-logo.png',
      name: 'default-logo.png',
    };

    if (criteria.schema) {
      const exitsLogo = await this.findLogo(criteria.schema);
      logo = exitsLogo !== null ? exitsLogo : defaultLogo;
    } else {
      logo = defaultLogo;
    }

    return {
      ...tenant,
      department,
      position,
      contracts: formattedContracts,
      logo: logo,
    };
  }

  async checkEmailExist(email: string) {
    email = email.toLocaleLowerCase();
    const tenant = await this.tenantEntity.findOne({
      where: [{ email }, { users: { email } }],
      relations: ['users'],
    });
    return tenant;
  }

  async update(
    criteria: { id?: number; schema?: string },
    data: TenantUpdateDto,
    isManagement = false,
  ) {
    const { contractStartDate, contractEndDate, contractType } = data;
    const contractStatus = data.contractStatus;
    const tenant = await this.findOne(criteria, true);
    if (!tenant) throw new BadRequestException('Tenant not found');
    if (data.phone) {
      const tenantByPhone = await this.tenantEntity
        .createQueryBuilder('t')
        .where(
          `pgp_sym_decrypt(t.phone::bytea, '${this.configService.get('ENCRYPT_KEY')}') = '${data.phone}'`,
        )
        .getOne();
      if (tenantByPhone && tenantByPhone.email != tenant.email) {
        throw new BadRequestException(
          'This phone already exists. Please try another phone!',
        );
      }
    }

    const id = tenant.id;
    if (
      contractStartDate ||
      contractEndDate ||
      Number.isInteger(contractStatus) ||
      contractType
    ) {
      const startDate = moment(contractStartDate?.toString().split('+')[0])
        .startOf('day')
        .toDate();
      const endDate = moment(contractEndDate?.toString().split('+')[0])
        .endOf('day')
        .toDate();
      if (
        contractStartDate &&
        contractEndDate &&
        startDate.getTime() > endDate.getTime()
      ) {
        throw new BadRequestException(
          'The start date cannot exceed the end date. Please try again!',
        );
      }
      const { entities, raw } = await this.contractEntity
        .createQueryBuilder('c')
        .addSelect(
          `pgp_sym_decrypt(c.start_date::bytea,'${process.env.ENCRYPT_KEY}')`,
          'start_date',
        )
        .addSelect(
          `pgp_sym_decrypt(c.end_date::bytea,'${process.env.ENCRYPT_KEY}')`,
          'end_date',
        )
        .where(`tenant_id = ${id}`)
        .getRawAndEntities();
      const contract = entities[0];
      const dataSave: DeepPartial<ContractEntity> = {};
      if (contractStartDate) {
        dataSave.start_date = moment(startDate)
          .startOf('day')
          .local()
          .format('YYYY-MM-DDTHH:mm:ss.SSS');
      }
      if (contractEndDate) {
        dataSave.end_date = moment(endDate)
          .endOf('day')
          .local()
          .format('YYYY-MM-DDTHH:mm:ss.SSS');
      }
      if (Number.isInteger(contractStatus)) dataSave.status = contractStatus;
      if (contractType) dataSave.type = contractType;
      if (contract) {
        if (
          moment(contractStartDate).format('YYYY-MM-DD') !==
            moment(contract.start_date).format('YYYY-MM-DD') ||
          moment(contractEndDate).format('YYYY-MM-DD') !==
            moment(contract.end_date).format('YYYY-MM-DD') ||
          contractStatus !== contract.status
        ) {
          if (
            (contractStartDate &&
              !contractEndDate &&
              startDate.getTime() > contract.end_date.getTime()) ||
            (contractEndDate &&
              !contractStartDate &&
              endDate.getTime() < contract.start_date.getTime())
          ) {
            throw new BadRequestException(
              'The start date cannot exceed the end date. Please try again!',
            );
          }
        }
        contract.start_date = raw[0].start_date;
        contract.end_date = raw[0].end_date;
        // await this.contractEntity.update({ tenant_id: id }, dataSave);
        let updateStr = ``;
        for (const d in dataSave) {
          if (d === 'status') {
            updateStr += (updateStr ? ',' : '') + `status = ${dataSave.status}`;
          } else {
            updateStr +=
              (updateStr ? ',' : '') +
              `${d} = pgp_sym_encrypt('${dataSave[d]}', '${process.env.ENCRYPT_KEY}')`;
          }
        }
        await this.dataSource.query(
          `update public.contract set ${updateStr} where tenant_id = ${id}`,
        );
      } else {
        if (
          !contractStartDate ||
          !contractEndDate ||
          !Number.isInteger(contractStatus) ||
          !contractType
        ) {
          throw new BadRequestException(
            'Contract missing Start Date, End Date, status or type',
          );
        }
        let colsString = ``;
        let valuesStr = ``;
        dataSave.tenant_id = id;
        for (const d in dataSave) {
          colsString += (valuesStr ? ',' : '') + d;
          if (d === 'status' || d === 'tenant_id') {
            valuesStr +=
              (valuesStr ? ',' : '') +
              `${d === 'status' ? dataSave.status : dataSave.tenant_id}`;
          } else {
            valuesStr +=
              (valuesStr ? ',' : '') +
              `PGP_SYM_ENCRYPT('${dataSave[d]}','${process.env.ENCRYPT_KEY}')`;
          }
        }
        await this.dataSource.query(
          `insert into public.contract (${colsString}) VALUES (${valuesStr})`,
        );
      }
      const current = new Date().getTime();
      if (
        current < endDate.getTime() &&
        current > startDate.getTime() &&
        contractStatus === ESTATUS.ACTIVE &&
        !tenant.send_mail_at
      ) {
        const password = randomPassword();
        await Promise.all([
          this.userMasterService.update({ email: tenant.email }, { password }),
          this.tenantEntity.update({ id }, { send_mail_at: true }),
        ]);
        this.mailService.sendPasswordWhenApprove({
          email: tenant.email,
          newPass: password,
          organization: tenant.organization,
          operator: tenant.operator,
        });
      }
    }
    delete data.contractStartDate;
    delete data.contractEndDate;
    delete data.contractStatus;
    delete data.contractType;
    delete data.password;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      let setStr = '';
      for (const item in data) {
        if (['email', 'phone', 'operator'].includes(item)) {
          setStr +=
            (setStr ? ', ' : '') +
            item +
            '=' +
            `PGP_SYM_ENCRYPT('${data[item]}','${this.configService.get('ENCRYPT_KEY')}')`;
        } else if (item === 'department' || item === 'position') {
          if (tenant.schema !== null) {
            if (data[item]['data']) {
              await manage.query(
                `update "${tenant.schema}".combo_box 
                set data = pgp_sym_encrypt('${data[item]['data']}', '${this.configService.get('ENCRYPT_KEY')}') 
                where id = ${data[item]['id']}`,
              );
            } else {
              setStr += (setStr ? ', ' : '') + item + '=' + data[item];
            }
          } else {
            setStr +=
              (setStr ? ', ' : '') +
              item +
              '=' +
              `PGP_SYM_ENCRYPT('${data[item]}','${this.configService.get('ENCRYPT_KEY')}')`;
          }
        } else {
          if (item !== 'logo') {
            setStr +=
              (setStr ? ', ' : '') +
              item +
              '=' +
              (typeof data[item] === 'string' ? `'${data[item]}'` : data[item]);
          }
        }
      }
      if (setStr) {
        await manage.query(
          `update public.tenant set ${setStr} where id = ${id}`,
        );
      }
      if (data.logo) {
        await manage.query(
          `update "${tenant.schema}".logo set image = '${data.logo.image}', name = '${data.logo.name}' 
          where id = ${id}`,
        );
      }
      // await manage.update(TenantEntity, { id }, { ...data });
      if (data.operator !== undefined && tenant.approved_time) {
        const updatedTenant = await manage.findOne(TenantEntity, {
          where: { id },
        });
        await this.updateInforUser(
          tenant.email,
          updatedTenant.operator,
          tenant.schema,
          data.department,
          data.position,
          updatedTenant.phone,
          manage,
        );
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
    return isManagement
      ? await this.findOneWithContract({ id })
      : await this.findOne({ id });
  }

  @Cron('0 0 * * *')
  async sendMailWhenContractValid() {
    const current = new Date();
    const startDay = new Date(current.setHours(0, 0, 0, 0)).toISOString();
    const endDay = new Date(current.setHours(23, 59, 59, 999)).toISOString();
    const tenants = await this.tenantEntity
      .createQueryBuilder('t')
      .leftJoin('t.contracts', 'c')
      .where(
        `c.end_date::timestamp > '${endDay}'::timestamp and c.start_date::timestamp <= '${startDay}'::timestamp 
        and c.status = 1 and t.approved_time is not null and (t.send_mail_at = false or t.send_mail_at is null)`,
      )
      .getMany();
    for (const tenant of tenants) {
      const password = randomPassword();
      try {
        await Promise.all([
          this.userMasterService.update({ email: tenant.email }, { password }),
          this.tenantEntity.update({ id: tenant.id }, { send_mail_at: true }),
        ]);
        this.mailService.sendPasswordWhenApprove({
          email: tenant.email,
          newPass: password,
          organization: tenant.organization,
          operator: tenant.operator,
        });
      } catch (error) {}
    }
    return tenants;
  }

  async approve(id: number, schema: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const tenant = await manage.findOne(TenantEntity, {
        where: { id, approved_time: IsNull() },
      });
      if (!tenant) {
        throw new BadRequestException('There is no tenant to approve');
      }
      const check = await manage.findOne(TenantEntity, {
        where: { schema },
      });
      if (check) {
        throw new BadRequestException(
          // 'This Customer ID already exists. Please try another ID!',
          '이 고객 ID는 이미 존재합니다. 다른 ID를 시도해 주세요!',
        );
      }
      await manage.update(
        TenantEntity,
        { id },
        { schema, approved_time: new Date() },
      );

      const createPermissionOP = await this.createPermissionWithTransaction(
        tenant.id,
        manage,
      );
      const createUserData = {
        email: tenant.email,
        role: EUserRole.OP,
        full_name: tenant.operator.trim(),
      };
      const userMaster = await this.userMasterService.createWithTransaction(
        {
          ...createUserData,
          tenant_id: tenant.id,
          phone_number: tenant.phone,
          permission_id: createPermissionOP.id,
        },
        manage,
      );
      await manage.query(createSchema(schema.toLowerCase()));
      const connection = connect(
        `amqp://${this.configService.get<string>('RABBITMQ_USER')}:${this.configService.get<string>('RABBITMQ_PASS')}@${this.configService.get<string>('RABBITMQ_HOST')}`,
      );
      connection.createChannel({
        json: true,
        // setup: async (channel: amqp.Channel) => {
        setup: async (channel: any) => {
          const schemaName = schema.toLowerCase();
          const exchangeName = `${schemaName}.exchange`;
          channel.assertExchange(exchangeName, 'direct', {
            durable: true,
          });
          const indexNames = [
            'drive_metrics',
            'vehicle_route',
            'vehicle_info',
            'edge_state',
            'collect_metrics',
            'illegal_discharges',
            'zscore_rollup',
          ];
          for (const queue of indexNames) {
            let checkQueue = null;
            const nameQueue = `${schemaName}.${queue}.que`;
            const routeKey = `${queue}.key`;
            channel.assertQueue(nameQueue, {
              durable: true,
            });
            do {
              const response = await axios.get(
                `http://${this.configService.get<string>('RABBITMQ_HOST_API')}/api/queues`,
                {
                  auth: {
                    username: this.configService.get<string>('RABBITMQ_USER'),
                    password: this.configService.get<string>('RABBITMQ_PASS'),
                  },
                },
              );
              checkQueue = (response.data as any[]).filter(
                (q) => q.name === nameQueue,
              )[0];
            } while (!checkQueue);
            channel.bindQueue(nameQueue, exchangeName, routeKey);
          }
          return channel;
        },
      });
      //approved index name by open search
      await approvedIndex(schema.toLowerCase());

      const [departmentResult, positionResult] = await Promise.all([
        manage.query(
          `insert into "${schema}".combo_box (field, data) values ('department', '${tenant.department}') RETURNING id;`,
        ),
        manage.query(
          `insert into "${schema}".combo_box (field, data) values ('position', '${tenant.position}')RETURNING id;`,
        ),
      ]);

      await manage.query(
        `insert into "${schema}".users (email, department, full_name, phone_number, position, role, status, master_id)
        values(
          '${userMaster.email}',${departmentResult[0].id},'${userMaster.full_name}','${tenant.phone}',
          ${positionResult[0].id},'${EUserRole.OP}',${UserStatus.ACTIVE},${userMaster.id}
        ) RETURNING id;`,
      );
      await manage.query(
        `insert into "${schema}".setting_notification (user_id) values (${userMaster.id})`,
      );

      await manage.query(
        `INSERT INTO "${schema}".metric_weight (distanceRatioRate, durationRatioRate, collectDistanceRate, collectDurationRate, collectCountRate, manualCollectTimeRate, alpha, pValue, percentageAE, percentageBD, percentageC) VALUES (0.15, 0.15, 0.15, 0.15, 0.3, 0.1, 1, 5, 0.1, 0.2, 0.4)`,
      );

      await manage.query(
        `UPDATE public.tenant SET department = $1, position = $2 WHERE id = $3`,
        [departmentResult[0].id, positionResult[0].id, tenant.id],
      );

      await queryRunner.commitTransaction();
      const dataSource = new DataSource({
        type: process.env.DATABASE_TYPE as any,
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DATABASE,
        schema: schema,
        entities: [
          StaffEntity,
          VehicleEntity,
          UserEntity,
          ComboBoxEntity,
          SettingNotificationEntity,
          NotificationEntity,
          EdgeServeEntity,
          WorkingScheduleEntity,
          RouteEntity,
          SegmentEntity,
          SectionEntity,
          SegmentRouteMapEntity,
          CoreSectionEntity,
          GuideEntity,
          CongestionCodeEntity,
          GuideCodeEntity,
          PointEntity,
          MetadataEntity,
          StorageDataEntity,
          AbsenceStaffEntity,
          AbsenceVehicleEntity,
          SignHistoryEntity,
          SignatureEntity,
          DrivingDiaryEntity,
          DrivingRecordEntity,
          MetricWeightEntity,
          LandfillRecordEntity,
          ConfigWeightEntity,
          EdgeStateRawEntity,
          EdgeState1HourEntity,
          EdgeState1DayEntity,
        ],
        synchronize: true, //must sync true here, don't change to false pls
      });
      await dataSource.initialize();
      await dataSource.getRepository(UserEntity).find();
      await dataSource.getRepository(StaffEntity).find();
      await dataSource.getRepository(VehicleEntity).find();
      await dataSource.getRepository(SettingNotificationEntity).find();
      await dataSource.getRepository(NotificationEntity).find();
      await dataSource.getRepository(ComboBoxEntity).find();
      await dataSource.getRepository(EdgeServeEntity).find();
      await dataSource.getRepository(WorkingScheduleEntity).find();
      await dataSource.getRepository(RouteEntity).find();
      await dataSource.getRepository(SegmentEntity).find();
      await dataSource.getRepository(SectionEntity).find();
      await dataSource.getRepository(SegmentRouteMapEntity).find();
      await dataSource.getRepository(CoreSectionEntity).find();
      await dataSource.getRepository(GuideEntity).find();
      await dataSource.getRepository(GuideCodeEntity).find();
      await dataSource.getRepository(PointEntity).find();
      await dataSource.getRepository(CongestionCodeEntity).find();
      await dataSource.getRepository(MetadataEntity).find();
      await dataSource.getRepository(StorageDataEntity).find();
      await dataSource.getRepository(AbsenceStaffEntity).find();
      await dataSource.getRepository(AbsenceVehicleEntity).find();
      await dataSource.getRepository(MetricWeightEntity).find();
      await dataSource.getRepository(LandfillRecordEntity).find();
      await dataSource.getRepository(ConfigWeightEntity).find();
      await dataSource.getRepository(EdgeStateRawEntity).find();
      await dataSource.getRepository(EdgeState1HourEntity).find();
      await dataSource.getRepository(EdgeState1DayEntity).find();
      await this.dataSource.query(`SET search_path TO public;`);
      await this.createStream(schema.toLowerCase());
      return { id: userMaster.id, email: tenant.email };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
      await this.dataSource.query(`SET search_path TO public;`);
    }
  }

  async updateInforUser(
    email: string,
    full_name: string,
    schema: string,
    department: string,
    position: string,
    phone_number: string,
    manage: EntityManager,
  ) {
    const userMaster = await manage.query(
      `select id from public.users_master u where u.email = '${email}'`,
    );
    if (!userMaster[0]) {
      throw new BadRequestException('User not found');
    }

    const userMasterByPhone = await manage.query(
      `select * from public.users_master u where u.phone_number = '${phone_number}'`,
    );
    if (userMasterByPhone.length > 0 && userMasterByPhone[0].email != email) {
      throw new BadRequestException('User not found');
    }

    const userMater = await manage.query(
      `UPDATE public.users_master SET full_name = $1, phone_number = $3 WHERE email = $2`,
      [full_name, email, phone_number],
    );

    if (userMater) {
      const departmentNumber = Number(department);
      const positionNumber = Number(position);

      if (!isNaN(departmentNumber) && !isNaN(positionNumber)) {
        await manage.query(
          `UPDATE "${schema}".users SET full_name = $1, department = $3, position = $4, phone_number = $5 WHERE email = $2`,
          [full_name, email, departmentNumber, positionNumber, phone_number],
        );
      } else {
        await manage.query(
          `UPDATE "${schema}".users SET full_name = $1, phone_number = $3 WHERE email = $2`,
          [full_name, email, phone_number],
        );
      }
    }

    return userMater;
  }

  async findSchemaComboboxById(schema: string, id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manage = queryRunner.manager;
      // const combobox = await manage.query(
      //   `SELECT * FROM "${schema}".combo_box WHERE id = $1`,
      //   [id],
      // );
      const combobox = await manage.query(
        `SELECT id, PGP_SYM_DECRYPT(data::bytea, '${this.configService.get('ENCRYPT_KEY')}') as data 
        FROM "${schema}".combo_box WHERE id = ${id}`,
      );

      if (!combobox.length) {
        return null;
      }

      await queryRunner.commitTransaction();
      return combobox[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async createStream(tenant) {
    const client = await rabbit.connect({
      hostname: this.configService.get<string>('RABBITMQ_STREAM_HOST_NAME'),
      port: Number(this.configService.get<string>('RABBITMQ_STREAM_PORT')),
      username: this.configService.get<string>('RABBITMQ_USER'),
      password: this.configService.get<string>('RABBITMQ_PASS'),
      vhost: this.configService.get<string>('RABBITMQ_STREAM_VHOST'),
    });
    await client.createSuperStream({ streamName: tenant });
    await client.close();
  }

  async findLogo(schema: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manage = queryRunner.manager;
      const logo = await manage.query(`SELECT * FROM "${schema}".logo LIMIT 1`);

      if (!logo.length) {
        return null;
      }

      await queryRunner.commitTransaction();
      return { image: logo[0].image, name: logo[0].name };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async createPermissionWithTransaction(tenantId, manage) {
    const OP = {
      tenant_id: tenantId,
      type: PERMISSION_TYPE.OP,
      name: '운영자',
      dashboard: PERMISSION.READ,
      work_shift: FULL.toString(),
      realtime_activity: RX.toString(),
      operation_analysis: RUX.toString(),
      illegal_disposal: RX.toString(),
      driving_diary: RUX.toString(),
      notification: RU.toString(),
      user_management: CRUD.toString(),
      company_management: RU.toString(),
      staff_management: CRUD.toString(),
      vehicle_management: CRUD.toString(),
      route_management: PERMISSION.READ,
      absence_management: CRUD.toString(),
      updater_application_management: PERMISSION.READ,
    };

    const dispatchManager = {
      tenant_id: tenantId,
      name: '배차관리자',
      dashboard: PERMISSION.READ,
      work_shift: FULL.toString(),
      realtime_activity: RX.toString(),
      operation_analysis: RUX.toString(),
      illegal_disposal: RX.toString(),
      driving_diary: RUX.toString(),
      notification: RU.toString(),
      staff_management: RU.toString(),
      vehicle_management: RU.toString(),
      absence_management: CRUD.toString(),
    };

    const user = {
      tenant_id: tenantId,
      name: '사용자',
      dashboard: PERMISSION.READ,
      work_shift: PERMISSION.READ,
      realtime_activity: PERMISSION.READ,
      operation_analysis: PERMISSION.READ,
      illegal_disposal: PERMISSION.READ,
      driving_diary: PERMISSION.READ,
    };
    const permissionOP = await manage.save(
      PermissionEntity,
      manage.create(PermissionEntity, OP),
    );
    await manage.save(
      PermissionEntity,
      manage.create(PermissionEntity, dispatchManager),
    );
    await manage.save(PermissionEntity, manage.create(PermissionEntity, user));
    return permissionOP;
  }
}
