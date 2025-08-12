import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { AbsenceVehicleEntity } from 'libs/entities/absence-vehicle.entity';
import {
  AbsenceVehicleCreateForm,
  AbsenceVehicleSearchForm,
  AbsenceVehicleUpdateForm,
} from './absence-vehicle.dto';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import * as moment from 'moment';
import { ESORT_ABSENCE_VEHICLE } from 'libs/enums/common.enum';

@Injectable()
export class AbsenceVehicleService {
  constructor(
    @Inject('ABSENCE_VEHICLE_REPO')
    private absenceVehicleEntity: Repository<AbsenceVehicleEntity>,
    @Inject('VEHICLE_REPO')
    private vehicleEntity: Repository<VehicleEntity>,
    @Inject('WORKING_SCHEDULE_REPO')
    private workingScheduleEntity: Repository<WorkingScheduleEntity>,
  ) {}

  async index(query: AbsenceVehicleSearchForm) {
    const sql = this.absenceVehicleEntity
      .createQueryBuilder('av')
      .where({
        start_date: Between(query.start_date, query.end_date),
        ...(query.vehicle_id && { absence_vehicle: query.vehicle_id }),
      })
      .leftJoinAndSelect('av.absence_vehicle', 'absence_vehicle')
      .leftJoinAndSelect('av.replacement_vehicle', 'replacement_vehicle')
      .take(query.pageSize)
      .skip((query.page - 1) * query.pageSize);

    if (
      [
        ESORT_ABSENCE_VEHICLE.VEHICLENUMBER,
        ESORT_ABSENCE_VEHICLE.PURPOSE,
      ].includes(query.sortField as any)
    ) {
      sql.orderBy(`absence_vehicle.${query.sortField}`, query.sortBy as any);
    } else if (query.sortField === ESORT_ABSENCE_VEHICLE.REPLACE) {
      sql.orderBy(`replacement_vehicle.vehicle_number`, query.sortBy as any);
    } else if (query.sortField === ESORT_ABSENCE_VEHICLE.ABSENCETYPE) {
      sql
        .addSelect(
          `ARRAY_POSITION(
            ARRAY['MORNING', 'AFTERNOON', 'ANNUAL', 'OFFICIAL_LEAVE', 'SICK_LEAVE',
            'TRIBULATION_LEAVE', 'SPECIAL_LEAVE', 'LABOR_LEAVE', 'VACATION', 'TRAINING',
            'INDUSTRIAL', 'DISEASE', 'PARENTAL', 'SUSPENDED']::varchar[], 
            av.absence_type
          )`,
          'custom_order',
        )
        .orderBy(
          'custom_order',
          query.sortBy.toUpperCase() === 'ASC' ? 'DESC' : 'ASC',
        );
    } else if (query.sortField === ESORT_ABSENCE_VEHICLE.PERIOD) {
      sql.orderBy(`(av.end_date - av.start_date)`, query.sortBy as any);
    } else {
      sql.orderBy(`av.${query.sortField}`, query.sortBy as any);
    }
    const [items, total] = await sql.getManyAndCount();
    return { items: items, total };
  }

  async findById(id: number) {
    return await this.absenceVehicleEntity.findOne({
      where: { id },
      relations: ['absence_vehicle', 'replacement_vehicle'],
    });
  }

  async findByEndDate(query: AbsenceVehicleSearchForm) {
    const [items, total] = await this.absenceVehicleEntity
      .createQueryBuilder('av')
      .where({
        end_date: moment(query.end_date).format('YYYY-MM-DD 00:00:00'),
        ...(query.vehicle_id && { absence_vehicle: query.vehicle_id }),
      })
      .leftJoinAndSelect('av.absence_vehicle', 'absence_vehicle')
      .leftJoinAndSelect('av.replacement_vehicle', 'replacement_vehicle')
      .take(query.pageSize)
      .skip((query.page - 1) * query.pageSize)
      .orderBy(`av.${query.sortField}`, query.sortBy as any)
      .getManyAndCount();

    return { items: items, total };
  }

  async create(input: AbsenceVehicleCreateForm) {
    input.start_date = moment(input.start_date).format(
      'YYYY-MM-DD 00:00:00',
    ) as any;
    input.end_date = moment(input.end_date)
      .utc()
      .format('YYYY-MM-DD 00:00:00') as any;
    const [checkAbsContract, checkReplaceContract] = await Promise.all([
      this.vehicleEntity.findOne({
        where: { id: input.absence_vehicle.id },
      }),
      this.vehicleEntity.findOne({
        where: { id: input.replacement_vehicle.id },
      }),
    ]);
    const momentAbsStart = moment(
      checkAbsContract.operation_start_date,
    ).subtract(1);
    const momentAbsEnd = moment(
      checkAbsContract.operation_end_date || input.end_date,
    ).add(1);
    const momentReplaceStart = moment(
      checkReplaceContract.operation_start_date,
    ).subtract(1);
    const momentReplaceEnd = moment(
      checkReplaceContract.operation_end_date || input.end_date,
    ).add(1);
    if (
      !moment(input.start_date).isBetween(momentAbsStart, momentAbsEnd) ||
      !moment(input.end_date).isBetween(momentAbsStart, momentAbsEnd) ||
      !moment(input.start_date).isBetween(
        momentReplaceStart,
        momentReplaceEnd,
      ) ||
      !moment(input.end_date).isBetween(momentReplaceStart, momentReplaceEnd)
    ) {
      throw new BadRequestException(
        // 'This vehicle is unavailable. Please choose another vehicle!',
        // '이 차량은 비활성화됩니다. 다른 차량을 선택해 주세요!',
        '운행이 비활성화된 차량입니다. 다른 차량을 선택해 주세요.',
      );
    }
    const absenceVehicle = input.absence_vehicle.id;
    const replaceVehicle = input.replacement_vehicle.id;
    const checkAbsenceVehicle = await this.absenceVehicleEntity
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.absence_vehicle', 'av')
      .leftJoinAndSelect('a.replacement_vehicle', 'rv')
      .where(
        `(a.absence_vehicle in (${absenceVehicle}, ${replaceVehicle}) 
          or a.replacement_vehicle in (${absenceVehicle}, ${replaceVehicle})) 
        and (
        (a.start_date between '${input.start_date}'::timestamp and '${input.end_date}'::timestamp
          or a.end_date between '${input.start_date}'::timestamp and '${input.end_date}'::timestamp) 
        or('${input.start_date}'::timestamp between a.start_date and a.end_date 
          or '${input.end_date}'::timestamp between a.start_date and a.end_date)
        )`,
      )
      .getOne();
    if (checkAbsenceVehicle) {
      if (
        [
          checkAbsenceVehicle.absence_vehicle.id,
          checkAbsenceVehicle.replacement_vehicle.id,
        ].includes(absenceVehicle)
      ) {
        throw new BadRequestException(
          '이미 부재 설정된 인력입니다. 다른 차량을 선택해 주세요.',
        );
      }
      if (
        [
          checkAbsenceVehicle.absence_vehicle.id,
          checkAbsenceVehicle.replacement_vehicle.id,
        ].includes(replaceVehicle)
      ) {
        throw new BadRequestException(
          '이미 부재 설정된 대체 인력입니다. 다른 대체 차량을 선택해 주세요.',
        );
      }
      throw new BadRequestException(
        // `This vehicle is unavailable. Please choose another vehicle!`,
        // '이 차량은 비활성화됩니다. 다른 차량을 선택해 주세요!',
        '이미 부재 설정된 대체 인력입니다. 다른 대체 차량을 선택해 주세요.',
      );
    }

    const entity = this.absenceVehicleEntity.create(input);
    const saveAbsence = await this.absenceVehicleEntity.save(entity);
    const absenceVehicleNew = await this.absenceVehicleEntity.findOne({
      where: { id: saveAbsence.id },
      relations: ['absence_vehicle', 'replacement_vehicle'],
    });

    // await this.updateVehicle();
    const check = await this.workingScheduleEntity
      .createQueryBuilder('w')
      .where(
        `w.working_date between '${input.start_date}'::timestamp and '${input.end_date}'::timestamp 
          and (w.vehicle_id = ${input.replacement_vehicle.id} or w.backup_vehicle_id = ${input.replacement_vehicle.id})`,
      )
      .getOne();
    if (check) {
      throw new BadRequestException(
        // `This vehicle is unavailable. Please choose another vehicle!`,
        // '이 차량은 비활성화됩니다. 다른 차량을 선택해 주세요!',
        '이미 부재 설정된 대체 인력입니다. 다른 대체 차량을 선택해 주세요.',
      );
    }
    const workShifts = await this.workingScheduleEntity
      .createQueryBuilder('w')
      .where(
        `w.working_date between '${input.start_date}'::timestamp and '${input.end_date}'::timestamp 
          and (w.vehicle_id = ${input.absence_vehicle.id} or w.backup_vehicle_id = ${input.absence_vehicle.id})`,
      )
      .getMany();
    if (workShifts.length) {
      for (const workShift of workShifts) {
        await this.workingScheduleEntity.update(
          { id: workShift.id },
          {
            backup_vehicle_id: input.replacement_vehicle.id,
          },
        );
      }
    }
    return absenceVehicleNew;
  }

  async update(id: number, input: AbsenceVehicleUpdateForm) {
    input.start_date = moment(input.start_date).format(
      'YYYY-MM-DD 00:00:00',
    ) as any;
    input.end_date = moment(input.end_date)
      .utc()
      .format('YYYY-MM-DD 00:00:00') as any;
    const absenceVehicle = input.absence_vehicle.id;
    const replaceVehicle = input.replacement_vehicle.id;
    const checkAbsenceVehicle = await this.absenceVehicleEntity
      .createQueryBuilder()
      .where(
        `id != ${id} and (absence_vehicle in (${absenceVehicle}, ${replaceVehicle}) 
            or replacement_vehicle in (${absenceVehicle}, ${replaceVehicle})) 
          and (
          (start_date between '${input.start_date}'::timestamp and '${input.end_date}'::timestamp
            or end_date between '${input.start_date}'::timestamp and '${input.end_date}'::timestamp) 
          or('${input.start_date}'::timestamp between start_date and end_date 
            or '${input.end_date}'::timestamp between start_date and end_date)
          )`,
      )
      .getOne();
    if (checkAbsenceVehicle) {
      if (
        [
          checkAbsenceVehicle.absence_vehicle.id,
          checkAbsenceVehicle.replacement_vehicle.id,
        ].includes(absenceVehicle)
      ) {
        throw new BadRequestException(
          '이미 부재 설정된 인력입니다. 다른 차량을 선택해 주세요.',
        );
      }
      if (
        [
          checkAbsenceVehicle.absence_vehicle.id,
          checkAbsenceVehicle.replacement_vehicle.id,
        ].includes(replaceVehicle)
      ) {
        throw new BadRequestException(
          '이미 부재 설정된 대체 인력입니다. 다른 대체 차량을 선택해 주세요.',
        );
      }
      throw new BadRequestException(
        // `This vehicle is unavailable. Please choose another vehicle!`,
        // '이 차량은 비활성화됩니다. 다른 차량을 선택해 주세요!',
        '이미 부재 설정된 대체 인력입니다. 다른 대체 차량을 선택해 주세요.',
      );
    }

    try {
      await this.absenceVehicleEntity.update(id, input);
      const absenceVehicle = await this.absenceVehicleEntity.findOne({
        where: { id: id },
        relations: ['absence_vehicle', 'replacement_vehicle'],
      });

      await this.updateVehicle();
      if (
        (input.start_date && input.start_date !== absenceVehicle.start_date) ||
        (input.end_date && input.end_date !== absenceVehicle.end_date)
      ) {
        const workShifts = await this.workingScheduleEntity
          .createQueryBuilder('w')
          .where(
            `w.working_date between '${input.start_date}'::timestamp and '${input.end_date}'::timestamp 
            and (w.vehicle_id = ${input.absence_vehicle.id} or w.backup_vehicle_id = ${input.absence_vehicle.id})`,
          )
          .getMany();
        if (workShifts.length) {
          for (const workShift of workShifts) {
            await this.workingScheduleEntity.update(
              { id: workShift.id },
              {
                backup_vehicle_id: input.replacement_vehicle.id,
              },
            );
          }
        }
      }
      return absenceVehicle;
    } catch (error) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }
  }

  async delete(id: number) {
    const data = await this.absenceVehicleEntity.delete(id);

    if (!data.affected) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }

    await this.updateVehicle();

    return true;
  }

  async deleteMany(ids) {
    const data = await this.absenceVehicleEntity
      .createQueryBuilder()
      .where('id IN(:...ids)', { ids })
      .delete()
      .execute();

    if (!data.affected) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }

    await this.updateVehicle();

    return data.affected;
  }

  async updateVehicle() {
    // const absenceVehicle = await this.absenceVehicleEntity
    //   .createQueryBuilder('av')
    //   .leftJoinAndSelect('av.absence_vehicle', 'absence_vehicle')
    //   .orderBy('start_date', 'DESC')
    //   .getOne();
    // await this.vehicleEntity
    //   .createQueryBuilder()
    //   .update()
    //   .where({ id: absenceVehicle.absence_vehicle.id })
    //   .set({ absence: absenceVehicle })
    //   .execute();
  }
}
