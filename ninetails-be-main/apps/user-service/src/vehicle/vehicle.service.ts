import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { In, Like, Not, Repository } from 'typeorm';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import {
  SearchValueVehicleReq,
  VehicleCreateForm,
  VehicleUpdateForm,
  VehicleUpdateManyInput,
} from './vehicle.dto';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import { AbsenceVehicleEntity } from 'libs/entities/absence-vehicle.entity';
import * as moment from 'moment';
import { ESORTVEHICLE, VEHICLE_STATUS } from 'libs/enums/common.enum';

@Injectable()
export class VehicleService {
  constructor(
    @Inject('VEHICLE_REPO')
    private vehicleEntity: Repository<VehicleEntity>,
    @Inject('WORKING_SCHEDULE_REPO')
    private workingScheduleEntity: Repository<WorkingScheduleEntity>,
    @Inject('ABSENCE_VEHICLE_REPO')
    private absenceVehicleEntity: Repository<AbsenceVehicleEntity>,
  ) {}

  async list(query: SearchValueVehicleReq) {
    const today = moment().format('YYYY-MM-DD 00:00:00');
    let sortField = `v.${query.sortField}`;
    if (query.sortField == 'status') {
      query.sortBy = (query.sortBy === 'ASC' ? 'DESC' : 'ASC') as any;
    }

    if (query.sortField === ESORTVEHICLE.ABSENCE_START) {
      sortField = 'absence.start_date';
    } else if (
      [
        ESORTVEHICLE.MANUFACTURER,
        ESORTVEHICLE.MODEL,
        ESORTVEHICLE.TYPE,
        ESORTVEHICLE.CAPACITY,
        ESORTVEHICLE.MAXCAPACITY,
      ].includes(query.sortField)
    ) {
      sortField = query.sortField + '.data';
    } else if (query.sortField === ESORTVEHICLE.REPLACE) {
      sortField = 'replacement_vehicle.vehicle_number';
    }

    const sql = this.vehicleEntity
      .createQueryBuilder('v')
      .addSelect(
        `pgp_sym_decrypt(vehicle_type.data::bytea,'${process.env.ENCRYPT_KEY}')`,
        'vehicle_type',
      )
      .addSelect(
        `pgp_sym_decrypt(manufacturer.data::bytea,'${process.env.ENCRYPT_KEY}')`,
        'manufacturer',
      )
      .addSelect(
        `pgp_sym_decrypt(capacity.data::bytea,'${process.env.ENCRYPT_KEY}')`,
        'capacity',
      )
      .addSelect(
        `pgp_sym_decrypt(vehicle_model.data::bytea,'${process.env.ENCRYPT_KEY}')`,
        'vehicle_model',
      )
      .addSelect(
        `pgp_sym_decrypt(max_capacity.data::bytea,'${process.env.ENCRYPT_KEY}')`,
        'max_capacity',
      )
      .addSelect(
        `pgp_sym_decrypt(special_features.data::bytea,'${process.env.ENCRYPT_KEY}')`,
        'special_features',
      )
      .where({
        ...(query.search && { vehicle_number: Like(`%${query.search}%`) }),
        ...(query.purpose && { purpose: In(query.purpose.split(',')) }),
        ...(query.status && { status: query.status }),
      })
      .leftJoinAndSelect('v.vehicle_type', 'vehicle_type')
      .leftJoinAndSelect('v.vehicle_model', 'vehicle_model')
      .leftJoinAndSelect('v.manufacturer', 'manufacturer')
      .leftJoinAndSelect('v.capacity', 'capacity')
      .leftJoinAndSelect('v.max_capacity', 'max_capacity')
      .leftJoinAndSelect('v.special_features', 'special_features')
      .leftJoinAndSelect(
        'v.absence',
        'absence',
        `('${today}'::timestamp between absence.start_date and absence.end_date 
        or '${today}'::timestamp < absence.start_date) and absence.deleted_at is null`,
      )
      .leftJoinAndSelect('absence.replacement_vehicle', 'replacement_vehicle')
      .take(query.pageSize)
      .skip((query.page - 1) * query.pageSize);

    if (query.sortField === ESORTVEHICLE.STATUS) {
      sql
        .addSelect(
          `ARRAY_POSITION(
            ARRAY['NORMAL', 'MAINTENANCE', 'DISPOSED', 'RETIRED']::varchar[], 
            v.status
          )`,
          'custom_order',
        )
        .orderBy(
          'custom_order',
          query.sortBy.toUpperCase() === 'ASC' ? 'DESC' : 'ASC',
        );
    } else if (query.sortField === ESORTVEHICLE.ABSENCETYPE) {
      sql
        .addSelect(
          `ARRAY_POSITION(
            ARRAY['MORNING', 'AFTERNOON', 'ALLDAY', 'OFFICIAL_LEAVE', 'SICK_LEAVE',
            'TRIBULATION_LEAVE', 'SPECIAL_LEAVE', 'LABOR_LEAVE', 'VACATION', 'TRAINING',
            'INDUSTRIAL', 'DISEASE', 'PARENTAL', 'SUSPENDED']::varchar[], 
            absence.absence_type
          )`,
          'custom_order',
        )
        .orderBy(
          'custom_order',
          query.sortBy.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
          query.sortBy.toUpperCase() === 'ASC' ? 'NULLS FIRST' : 'NULLS LAST',
        );
    } else {
      sql.orderBy(
        `${sortField}`,
        query.sortBy as any,
        query.sortBy.toUpperCase() === 'ASC' ? 'NULLS FIRST' : 'NULLS LAST',
      );
    }
    const [{ entities: vehicles, raw }, total] = await Promise.all([
      sql.getRawAndEntities(),
      sql.getCount(),
    ]);
    // const vehicleIds = vehicles.map((v) => v.id).join(',');
    // const absences = await this.absenceVehicleEntity
    //   .createQueryBuilder('a')
    //   .where(
    //     `('${today}'::timestamp between a.start_date and a.end_date or '${today}'::timestamp < a.start_date)
    //     and a.absence_vehicle in (${vehicleIds})`,
    //   )
    //   .leftJoinAndSelect('a.absence_vehicle', 'av')
    //   .leftJoinAndSelect('a.replacement_vehicle', 'rv')
    //   .orderBy('a.start_date', 'DESC')
    //   .getMany();

    return {
      vehicles: vehicles.map((v, i) => {
        const rawItem = raw.find((r) => r.v_id === v.id);
        if (v.vehicle_type) v.vehicle_type.data = rawItem.vehicle_type;
        if (v.vehicle_model) v.vehicle_model.data = rawItem.vehicle_model;
        if (v.capacity) v.capacity.data = rawItem.capacity;
        if (v.max_capacity) v.max_capacity.data = rawItem.max_capacity;
        if (v.manufacturer) v.manufacturer.data = rawItem.manufacturer;
        if (v.special_features) v.special_features.data = rawItem.special_features;
        v.status = VEHICLE_STATUS.NORMAL;
        if (v.absence.length) {
          if (
            moment()
              .startOf('day')
              .isBetween(
                moment(v.absence[0].start_date).subtract(1),
                moment(v.absence[0].end_date).add(1),
              )
          ) {
            v.absence[0]['nearest'] = moment().format('YYYY-MM-DD');
            v.status = VEHICLE_STATUS.MAINTENANCE;
          } else {
            v.absence[0]['nearest'] = moment(v.absence[0].start_date).format(
              'YYYY-MM-DD',
            );
          }
        }
        if (moment(v.operation_end_date).startOf('day').isBefore(moment())) {
          v.status = VEHICLE_STATUS.RETIRED;
        }
        v.absence = v.absence[0] as any;
        return v;
      }),
      total,
    };
  }

  async create(input: VehicleCreateForm) {
    const check = await this.vehicleEntity
      .createQueryBuilder()
      .where({
        vehicle_number: input.vehicle_number,
      })
      .getExists();
    if (check)
      throw new BadRequestException(
        // 'This vehicle already exists. Please enter a different number.',
        '이 차량은 이미 존재합니다. 다른 번호를 입력해 주세요.',
      );

    const entity = this.vehicleEntity.create(input);
    try {
      let vehicle = await this.vehicleEntity.save(entity);
      vehicle = await this.detail(vehicle.id);
      return vehicle;
    } catch (error) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }
  }

  async update(id: number, input: VehicleUpdateForm) {
    const data = await this.vehicleEntity.findOneBy({ id: id });
    if (!data) {
      throw new BadRequestException('ID does not exist. Please try again!');
    }

    if (input.vehicle_number) {
      const check = await this.vehicleEntity
        .createQueryBuilder()
        .where({
          vehicle_number: input.vehicle_number,
          id: Not(id),
        })
        .getExists();
      if (check)
        throw new BadRequestException(
          // 'This vehicle already exists. Please enter a different number.',
          '이 차량은 이미 존재합니다. 다른 번호를 입력해 주세요.',
        );
    }

    try {
      if (
        input.operation_end_date &&
        moment(input.operation_end_date).isBefore(
          moment(data.operation_end_date),
        )
      ) {
        const endDate = moment(input.operation_end_date).format('YYYY-MM-DD');
        const absence = await this.absenceVehicleEntity
          .createQueryBuilder()
          .where(
            `(absence_vehicle = ${id} or replacement_vehicle = ${id}) and 
            '${endDate}'::timestamp < start_date`,
          )
          .getOne();
        if (absence) {
          throw new Error('INVALID_TIME');
        }
      }
      await this.vehicleEntity.update(id, input);
      const vehicle = await this.vehicleEntity.findOne({
        where: { id: id },
        relations: [
          'vehicle_type',
          'vehicle_model',
          'manufacturer',
          'capacity',
          'max_capacity',
          'special_features',
        ],
      });
      return vehicle;
    } catch (error) {
      if (error.message === 'INVALID_TIME') {
        throw new BadRequestException('Please select a valid time period');
      }
      throw new BadRequestException('Something went wrong. Please try again!');
    }
  }

  async detail(id: number) {
    const vehicle = await this.vehicleEntity.findOne({
      where: { id: id },
      relations: [
        'vehicle_type',
        'vehicle_model',
        'manufacturer',
        'capacity',
        'max_capacity',
        'special_features',
      ],
    });
    return vehicle;
  }

  async delete(id: number) {
    const checkInSchedule = await this.workingScheduleEntity
      .createQueryBuilder()
      .where({ vehicle_id: id })
      .getExists();

    if (checkInSchedule) {
      throw new BadRequestException(
        // 'Vehicle in working schedule!'
        '이 차량은 이미 작업 일정이 있습니다. 다른 차량을 선택해 주세요!',
      );
    }

    const checkInAbsence = await this.absenceVehicleEntity
      .createQueryBuilder()
      .where({ absence_vehicle: id })
      .orWhere({ replacement_vehicle: id })
      .getExists();

    if (checkInAbsence) {
      throw new BadRequestException(
        'Unable to delete this Vehicle. Please try another one!',
      );
    }

    const data = await this.vehicleEntity.delete(id);

    if (!data.affected) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }

    return true;
  }

  async updateMany(ids, input: VehicleUpdateManyInput) {
    await this.vehicleEntity
      .createQueryBuilder()
      .update()
      .set(input)
      .whereInIds(ids)
      .execute();

    const data = await this.vehicleEntity
      .createQueryBuilder()
      .whereInIds(ids)
      .getMany();

    return data;
  }

  async deleteMany(ids: number[]) {
    const checkInSchedule = await this.workingScheduleEntity
      .createQueryBuilder()
      .where({ vehicle_id: In(ids) })
      .getExists();

    if (checkInSchedule) {
      throw new BadRequestException(
        // 'Vehicle in working schedule!'
        '이 차량은 이미 작업 일정이 있습니다. 다른 차량을 선택해 주세요!',
      );
    }

    const checkInAbsence = await this.absenceVehicleEntity
      .createQueryBuilder()
      .where({ absence_vehicle: In(ids) })
      .orWhere({ replacement_vehicle: In(ids) })
      .getExists();

    if (checkInAbsence) {
      throw new BadRequestException(
        'Unable to delete this Vehicle. Please try another one!',
      );
    }

    const data = await this.vehicleEntity
      .createQueryBuilder()
      .where('id IN(:...ids)', { ids })
      .delete()
      .execute();

    if (!data.affected) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }

    return data.affected;
  }

  async findIdVehicle(id: number, key: string) {
    const vehicle = await this.vehicleEntity.findOneBy({ id: id });
    if (!vehicle) {
      throw new BadRequestException({
        message: 'Vehicle does not exist. Please try again!',
        field_name: key,
        error: 'Bad Request',
        statusCode: 400,
      });
    }
    return vehicle;
  }

  async findOneById(id: number) {
    return await this.vehicleEntity.findOneBy({ id: id });
  }
}
