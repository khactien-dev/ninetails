import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  DataSource,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import {
  CreateWorkingScheduleReq,
  DeleteWorkingScheduleReq,
  SearchWorkingScheduleReq,
  UpdateWorkingScheduleReq,
} from '../dto/working-schedule.dto';
import { StaffService } from '../staff/staff.service';
import { AbsenceStaffEntity } from 'libs/entities/absence-staff.entity';
import * as moment from 'moment';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import { AbsenceVehicleEntity } from 'libs/entities/absence-vehicle.entity';
import { REPEAT } from 'libs/common/constants/common.constant';
import { StaffEntity } from 'libs/entities/staff.entity';
import { StatisticService } from './statistic.service';
import { VEHICLE_STATUS } from 'libs/enums/common.enum';

@Injectable()
export class WorkingScheduleService {
  constructor(
    @Inject('WORKING_SCHEDULE_REPO')
    private workingScheduleEntity: Repository<WorkingScheduleEntity>,
    @Inject('VEHICLE_REPO')
    private vehicleEntity: Repository<VehicleEntity>,
    @Inject('ABSENCE_VEHICLE_REPO')
    private absenceVehicleEntity: Repository<AbsenceVehicleEntity>,
    private staffService: StaffService,
    @Inject('ABSENCE_STAFF_REPO')
    private absenceStaffEntity: Repository<AbsenceStaffEntity>,
    @Inject('STAFF_REPO')
    private staffEntity: Repository<StaffEntity>,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private statisticService: StatisticService,
  ) {}

  async getAll(data: SearchWorkingScheduleReq) {
    const query = this.workingScheduleEntity
      .createQueryBuilder('working_schedule')
      .leftJoinAndSelect('working_schedule.vehicle', 'vehicle')
      .leftJoinAndSelect('working_schedule.wsDriver', 'driver')
      .leftJoinAndSelect('working_schedule.wsBackupDriver', 'backup_driver')
      .leftJoinAndSelect('working_schedule.wsFieldAgent1', 'field_agent_1')
      .leftJoinAndSelect(
        'working_schedule.wsBackupFieldAgent1',
        'backup_field_agent_1',
      )
      .leftJoinAndSelect('working_schedule.wsFieldAgent2', 'field_agent_2')
      .leftJoinAndSelect(
        'working_schedule.wsBackupFieldAgent2',
        'backup_field_agent_2',
      );

    if (data.working_date !== undefined) {
      const date = moment(data.working_date).format('YYYY-MM-DD');
      query.andWhere(`working_schedule.working_date = '${date}'::timestamp`);
    }

    if (data.route_id !== undefined) {
      query.andWhere('working_schedule.route_id = :route_id', {
        route_id: data.route_id,
      });
    }

    if (data.purpose !== undefined) {
      query.andWhere(`working_schedule.purpose = '${data.purpose}'`);
    }

    let sortField;
    if (data.sortField === 'driver_name') {
      sortField = `driver.name`;
    } else if (data.sortField === 'backup_driver_name') {
      sortField = `backup_driver.name`;
    } else if (data.sortField === 'field_agent_1_name') {
      sortField = `field_agent_1.name`;
    } else if (data.sortField === 'backup_field_agent_1_name') {
      sortField = `backup_field_agent_1.name`;
    } else if (data.sortField === 'field_agent_2_name') {
      sortField = `field_agent_2.name`;
    } else if (data.sortField === 'backup_field_agent_2_name') {
      sortField = `backup_field_agent_2.name`;
    } else {
      sortField = `working_schedule.${data.sortField}`;
    }

    const [workingSchedules, total] = await query
      .take(data.pageSize)
      .skip((data.page - 1) * data.pageSize)
      .orderBy(sortField, data.sortBy.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')
      .getManyAndCount();

    return { workingSchedules, total };
  }

  async findAndCount(data: SearchWorkingScheduleReq) {
    const date = moment(data.working_date).format('YYYY-MM-DD');
    const query = this.workingScheduleEntity
      .createQueryBuilder('ws')
      .leftJoinAndSelect('ws.vehicle', 'vehicle')
      .leftJoinAndSelect(
        'vehicle.absence',
        'abv',
        `'${date}'::timestamp BETWEEN abv.start_date AND abv.end_date`,
      )
      .leftJoinAndSelect('ws.wsBackupVehicle', 'backup_vehicle')
      .leftJoinAndSelect('ws.wsDriver', 'driver')
      .leftJoinAndSelect('ws.wsBackupDriver', 'backup_driver')
      .leftJoinAndSelect('ws.wsFieldAgent1', 'field_agent_1')
      .leftJoinAndSelect('ws.wsBackupFieldAgent1', 'backup_field_agent_1')
      .leftJoinAndSelect('ws.wsFieldAgent2', 'field_agent_2')
      .leftJoinAndSelect('ws.wsBackupFieldAgent2', 'backup_field_agent_2')
      .leftJoinAndSelect('ws.route', 'r');

    if (data.working_date !== undefined) {
      query.andWhere(`ws.working_date = '${date}'::timestamp`);
    }

    if (data.route_id !== undefined) {
      query.andWhere('ws.route_id = :route_id', {
        route_id: data.route_id,
      });
    }

    if (data.purpose !== undefined) {
      query.andWhere(`ws.purpose = '${data.purpose}'`);
    }

    let sortField;
    if (data.sortField === 'driver_name') {
      sortField = `driver.name`;
    } else if (data.sortField === 'backup_driver_name') {
      sortField = `backup_driver.name`;
    } else if (data.sortField === 'field_agent_1_name') {
      sortField = `field_agent_1.name`;
    } else if (data.sortField === 'backup_field_agent_1_name') {
      sortField = `backup_field_agent_1.name`;
    } else if (data.sortField === 'field_agent_2_name') {
      sortField = `field_agent_2.name`;
    } else if (data.sortField === 'backup_field_agent_2_name') {
      sortField = `backup_field_agent_2.name`;
    } else {
      sortField = `ws.${data.sortField}`;
    }

    const [workingSchedules, total] = await query
      .take(data.pageSize)
      .skip((data.page - 1) * data.pageSize)
      .orderBy(sortField, data.sortBy.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')
      .getManyAndCount();

    const [staffAbsence, replaceAbsence] = await Promise.all([
      this.dataSource.query(
        `SELECT s.id, s.name, ab.absence_type, ab.repeat, ab.start_date, ab.end_date, ab.id as aid, ab.replacer_staff_id, 
        ab.repeat_days_week, ab.repeat_days_month 
        FROM "${data.schema}".staff s left join "${data.schema}".absence_staff ab 
        on ab.absence_staff_id = s.id 
        WHERE '${date}'::timestamp BETWEEN ab.start_date AND ab.end_date`,
      ),
      this.dataSource.query(
        `SELECT s.id, s.name, ab.absence_type, ab.repeat, ab.start_date, ab.end_date, ab.id as aid, ab.replacer_staff_id, 
        ab.repeat_days_week, ab.repeat_days_month 
        FROM "${data.schema}".staff s left join "${data.schema}".absence_staff ab 
        on ab.replacer_staff_id = s.id 
        WHERE '${date}'::timestamp BETWEEN ab.start_date AND ab.end_date`,
      ),
    ]);
    const [filterAbsenceStaff, filterReplaceStaff] = await Promise.all([
      this.statisticService.filterAbsenceStaff(staffAbsence, date as any),
      this.statisticService.filterAbsenceStaff(replaceAbsence, date as any),
    ]);
    for (const workingSchedule of workingSchedules) {
      workingSchedule.wsDriver.absence_staff = filterAbsenceStaff.find(
        (s) => s.id === workingSchedule.driver,
      );
      workingSchedule.wsDriver.replacer_staff = filterReplaceStaff.find(
        (s) => s.id === workingSchedule.driver,
      );
      const agent1 = filterAbsenceStaff.find(
        (s) => s.id === workingSchedule.field_agent_1,
      );
      if (agent1) {
        workingSchedule.wsFieldAgent1.absence_staff = agent1;
      }
      workingSchedule.wsFieldAgent1.replacer_staff = filterReplaceStaff.find(
        (s) => s.id === workingSchedule.field_agent_1,
      );
      const agent2 = filterAbsenceStaff.find(
        (s) => s.id === workingSchedule.field_agent_2,
      );
      if (agent2) {
        workingSchedule.wsFieldAgent2.absence_staff = agent2;
      }
      workingSchedule.wsFieldAgent2.replacer_staff = filterReplaceStaff.find(
        (s) => s.id === workingSchedule.field_agent_2,
      );
      if (workingSchedule.wsBackupDriver) {
        workingSchedule.wsBackupDriver.replacer_staff = filterReplaceStaff.find(
          (s) => s.id === workingSchedule.backup_driver,
        );
      }
      const backupAgent1 = filterReplaceStaff.find(
        (s) => s.id === workingSchedule.backup_field_agent_1,
      );
      if (backupAgent1) {
        workingSchedule.wsBackupFieldAgent1.replacer_staff = backupAgent1;
      }
      const backupAgent2 = filterReplaceStaff.find(
        (s) => s.id === workingSchedule.backup_field_agent_2,
      );
      if (backupAgent2) {
        workingSchedule.wsBackupFieldAgent2.replacer_staff = backupAgent2;
      }
    }
    return { workingSchedules, total };
  }

  async getWithStatistic(data: SearchWorkingScheduleReq) {
    const query =
      this.workingScheduleEntity.createQueryBuilder('working_schedule');

    if (data.working_date !== undefined) {
      const date = moment(data.working_date).format('YYYY-MM-DD');
      query.andWhere(`working_schedule.working_date = '${date}'::timestamp`);
    }

    if (data.route_id !== undefined) {
      query.andWhere('working_schedule.route_id = :route_id', {
        route_id: data.route_id,
      });
    }

    if (data.purpose !== undefined) {
      query.andWhere(`working_schedule.purpose = '${data.purpose}'`);
    }

    const total = await query.take(data.pageSize).getCount();

    const returnVal: {
      total: number;
      statistics?: object;
      staffSection?: object;
      vehicleSection?: object;
    } = { total };
    const { statistics, staffSection, vehicleSection } =
      await this.statisticService.statictic(data, total);

    returnVal.statistics = statistics;
    returnVal.staffSection = staffSection;
    returnVal.vehicleSection = vehicleSection;

    return returnVal;
  }

  async detail(id: number) {
    await this.findOne(id);

    return this.workingScheduleEntity
      .createQueryBuilder('working_schedule')
      .leftJoinAndSelect('working_schedule.licensePlate', 'vehicle')
      .leftJoinAndSelect('working_schedule.wsDriver', 'driver')
      .leftJoinAndSelect('working_schedule.wsBackupDriver', 'backup_driver')
      .leftJoinAndSelect('working_schedule.wsFieldAgent1', 'field_agent_1')
      .leftJoinAndSelect(
        'working_schedule.wsBackupFieldAgent1',
        'backup_field_agent_1',
      )
      .leftJoinAndSelect('working_schedule.wsFieldAgent2', 'field_agent_2')
      .leftJoinAndSelect(
        'working_schedule.wsBackupFieldAgent2',
        'backup_field_agent_2',
      )
      .where(`working_schedule.id = ${id}`)
      .getOne();
  }

  async create(data: CreateWorkingScheduleReq) {
    data = { ...data, working_date: await this.formatDate(data.working_date) };

    await this.checkUnableVehicle(data.vehicle_id, data.working_date);

    await this.checkUnableStaff(data);

    await this.checkExistingScheduleSameDate(data);

    await this.checkAlreadySelected(data);
    const workingDate = moment(data.working_date).format('YYYY-MM-DD 00:00:00');
    const absences = await this.absenceStaffEntity
      .createQueryBuilder('a')
      .where(
        `'${workingDate}'::timestamp BETWEEN a.start_date AND a.end_date 
        and (absence_staff_id in ('${data.driver}', '${data.field_agent_1}', '${data.field_agent_2}') 
        or replacer_staff_id in ('${data.driver}', '${data.field_agent_1}', '${data.field_agent_2}'))`,
      )
      .getMany();
    if (absences.length) {
      for (const absence of absences) {
        if (absence.repeat === REPEAT.WEEKLY) {
          const days = absence.repeat_days_week.split(',');
          const currWeek = moment(data.working_date).startOf('week');
          const startWeek = moment(absence.start_date).startOf('week');
          const space = currWeek.valueOf() - startWeek.valueOf();
          for (const day of days) {
            const indexDay = [
              'MONDAY',
              'TUESDAY',
              'WEDNESDAY',
              'THURSDAY',
              'FRIDAY',
              'SATURDAY',
            ].findIndex((i) => i === day);
            const dateOfDay = moment(absence.start_date)
              .startOf('week')
              .add(space)
              .day(indexDay + 1)
              .format('YYYY-MM-DD HH:mm:ss');
            if (dateOfDay === workingDate) {
              this.throwStaffUnavailable();
            }
          }
        } else if (absence.repeat === REPEAT.MONTHLY) {
          const days = absence.repeat_days_month.split(',');
          const currMonth = moment(data.working_date).startOf('month');
          const startMonth = moment(absence.start_date).startOf('month');
          const space = currMonth.valueOf() - startMonth.valueOf();
          for (const day of days) {
            const dateOfDay = currMonth
              .add(space)
              .add(+day - 1, 'day')
              .format('YYYY-MM-DD 00:00:00');
            if (dateOfDay === workingDate) {
              this.throwStaffUnavailable();
            }
          }
        } else {
          this.throwStaffUnavailable();
        }
      }
    }
    const newEntry = this.workingScheduleEntity.create({
      ...data,
      dispatch_no: await this.dispatchNo(data.working_date),
    });

    return await this.workingScheduleEntity.save(newEntry);
  }

  async update(id: number, data: UpdateWorkingScheduleReq) {
    const workingSchedule = await this.findOne(id);

    if (data.vehicle_id !== undefined) {
      await this.checkUnableVehicle(data.vehicle_id, data.working_date);
    }

    await this.checkUnableStaff(data);

    await this.checkAlreadySelected(data);

    await this.checkExistingScheduleSameDate(
      {
        ...data,
        working_date: workingSchedule.working_date,
      },
      id,
    );

    await this.workingScheduleEntity.update({ id: id }, data);
    return await this.findOne(id);
  }

  async findOne(id: number) {
    const workingSchedule = await this.workingScheduleEntity.findOneBy({ id });
    if (!workingSchedule) {
      throw new NotFoundException('Working Schedule Not Found');
    }
    return workingSchedule;
  }

  async delete(body: DeleteWorkingScheduleReq) {
    for (const id of body.id) {
      const workingSchedule = await this.findOne(id);
      if (workingSchedule) {
        await this.workingScheduleEntity.softDelete(id);
      }
    }
    return { message: 'Deletion process completed.' };
  }

  async formatDate(dateInput: Date) {
    const date = new Date(dateInput);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  async dispatchNo(working_date: Date) {
    const date = new Date(working_date);
    const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '');
    const lastEntryToday = await this.workingScheduleEntity.findOne({
      where: {
        dispatch_no: Like(`${formattedDate}-S%`),
      },
      order: {
        dispatch_no: 'DESC',
      },
    });

    let nextSequenceNumber = 1;

    if (lastEntryToday) {
      const lastSequence = lastEntryToday.dispatch_no.split('-S')[1];
      nextSequenceNumber = parseInt(lastSequence, 10) + 1;
    }

    return `${formattedDate}-S${nextSequenceNumber.toString().padStart(3, '0')}`;
  }

  async formattedDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  async checkAlreadySelected(
    data: CreateWorkingScheduleReq | UpdateWorkingScheduleReq,
  ) {
    const fieldIds = [];

    if (data.driver !== undefined && data.driver !== null) {
      fieldIds.push({ field_name: 'driver', id: data.driver });
    }

    // if (data.backup_driver !== undefined && data.backup_driver !== null) {
    //   fieldIds.push({ field_name: 'backup_driver', id: data.backup_driver });
    // }

    if (data.field_agent_1 !== undefined && data.field_agent_1 !== null) {
      fieldIds.push({ field_name: 'field_agent_1', id: data.field_agent_1 });
    }

    // if (
    //   data.backup_field_agent_1 !== undefined &&
    //   data.backup_field_agent_1 !== null
    // ) {
    //   fieldIds.push({
    //     field_name: 'backup_field_agent_1',
    //     id: data.backup_field_agent_1,
    //   });
    // }

    if (data.field_agent_2 !== undefined && data.field_agent_2 !== null) {
      fieldIds.push({ field_name: 'field_agent_2', id: data.field_agent_2 });
    }

    // if (
    //   data.backup_field_agent_2 !== undefined &&
    //   data.backup_field_agent_2 !== null
    // ) {
    //   fieldIds.push({
    //     field_name: 'backup_field_agent_2',
    //     id: data.backup_field_agent_2,
    //   });
    // }

    const uniqueFieldIds = new Set(fieldIds.map((field) => field.id));

    if (uniqueFieldIds.size !== fieldIds.length) {
      const duplicateField = fieldIds.find(
        (field, index) =>
          fieldIds.findIndex((f) => f.id === field.id) !== index,
      );

      throw new BadRequestException({
        message: '이 직원은 이미 선택되었습니다. 다른 직원을 선택해 주세요!',
        field_name: duplicateField.field_name,
        error: 'Bad Request',
        statusCode: 400,
      });
    }
  }

  async checkExistingScheduleSameDate(
    data: UpdateWorkingScheduleReq,
    scheduleId: number = null,
  ) {
    let query = this.workingScheduleEntity
      .createQueryBuilder('working_schedule')
      .where('working_schedule.working_date = :working_date', {
        working_date: data.working_date,
      });

    if (scheduleId !== null) {
      query = query.andWhere('working_schedule.id != :scheduleId', {
        scheduleId,
      });
    }

    const existingSchedules = await query.getMany();
    if (existingSchedules.length > 0) {
      const conflictingFields = [
        'vehicle_id',
        'route_id',
        'driver',
        'backup_driver',
        'field_agent_1',
        'backup_field_agent_1',
        'field_agent_2',
        'backup_field_agent_2',
      ];

      for (const schedule of existingSchedules) {
        for (const field of conflictingFields) {
          if (schedule[field] === data[field]) {
            let message =
              '이 직원은 비활성화됩니다. 다른 직원을 선택해 주세요!';
            if (field === 'route_id') {
              message =
                '이 배차 구역은 이미 작업 일정이 있습니다. 다른 구역을 선택해 주세요!';
            }

            if (field === 'vehicle_id') {
              message =
                // 'This vehicle already has a Working Schedule. Please choose another vehicle!';
                '이 차량은 이미 작업 일정이 있습니다. 다른 차량을 선택해 주세요!';
            }
            throw new BadRequestException({
              message: message,
              field_name: field,
              error: 'Bad Request',
              statusCode: 400,
            });
          }

          if (
            (data.vehicle_id === schedule.backup_vehicle_id &&
              schedule.backup_vehicle_id) ||
            (data.backup_vehicle_id === schedule.vehicle_id &&
              schedule.vehicle_id)
          ) {
            throw new BadRequestException({
              message:
                '이 차량은 이미 작업 일정이 있습니다. 다른 차량을 선택해 주세요!',
              field_name: field,
              error: 'Bad Request',
              statusCode: 400,
            });
          }

          if (
            (data.driver === schedule.backup_driver &&
              schedule.backup_driver) ||
            (data.backup_driver === schedule.driver && schedule.driver)
          ) {
            await this.throwStaffUnavailable();
          }

          if (
            (data.field_agent_1 === schedule.backup_field_agent_1 &&
              schedule.backup_field_agent_1) ||
            (data.field_agent_1 === schedule.field_agent_2 &&
              schedule.field_agent_2) ||
            (data.field_agent_1 === schedule.backup_field_agent_2 &&
              schedule.backup_field_agent_2)
          ) {
            await this.throwStaffUnavailable();
          }

          if (
            (data.backup_field_agent_1 === schedule.field_agent_1 &&
              schedule.field_agent_1) ||
            (data.backup_field_agent_1 === schedule.field_agent_2 &&
              schedule.field_agent_2) ||
            (data.backup_field_agent_1 === schedule.backup_field_agent_2 &&
              schedule.backup_field_agent_2)
          ) {
            await this.throwStaffUnavailable();
          }

          if (
            (data.field_agent_2 === schedule.field_agent_1 &&
              schedule.field_agent_1) ||
            (data.field_agent_2 === schedule.backup_field_agent_1 &&
              schedule.backup_field_agent_1) ||
            (data.field_agent_2 === schedule.backup_field_agent_2 &&
              schedule.backup_field_agent_2)
          ) {
            await this.throwStaffUnavailable();
          }

          if (
            (data.backup_field_agent_2 === schedule.field_agent_1 &&
              schedule.field_agent_1) ||
            (data.backup_field_agent_2 === schedule.backup_field_agent_1 &&
              schedule.backup_field_agent_1) ||
            (data.backup_field_agent_2 === schedule.field_agent_2 &&
              schedule.field_agent_2)
          ) {
            await this.throwStaffUnavailable();
          }
        }
      }
    }
  }

  async checkUnableVehicle(id: number, date?: Date) {
    const vehicle = await this.vehicleEntity
      .createQueryBuilder()
      .where({
        id: id,
      })
      .getOne();
    if (date) {
      if (
        vehicle &&
        (moment(date).isBefore(vehicle.operation_start_date) ||
          (vehicle.operation_end_date &&
            !moment(date).isBetween(
              moment(vehicle.operation_start_date).subtract(1),
              moment(vehicle.operation_end_date).add(1),
            )) ||
          vehicle.status === VEHICLE_STATUS.DISPOSED)
      ) {
        throw new BadRequestException({
          message: '이 차량은 비활성화됩니다. 다른 차량을 선택해 주세요!',
          field_name: 'vehicle_id',
          error: 'Bad Request',
          statusCode: 400,
        });
      }
      const [absence, replace] = await Promise.all([
        this.absenceVehicleEntity
          .createQueryBuilder()
          .where({
            absence_vehicle: id,
            start_date: LessThanOrEqual(date),
            end_date: MoreThanOrEqual(date),
          })
          .getExists(),
        this.absenceVehicleEntity
          .createQueryBuilder()
          .where({
            replacement_vehicle: id,
            start_date: LessThanOrEqual(date),
            end_date: MoreThanOrEqual(date),
          })
          .getExists(),
      ]);

      if (absence || replace) {
        throw new BadRequestException({
          message: '이 차량은 비활성화됩니다. 다른 차량을 선택해 주세요!',
          field_name: 'vehicle_id',
          error: 'Bad Request',
          statusCode: 400,
        });
      }
    }
  }

  async checkUnableStaffDriver(id: number, key: string) {
    const staffDriver = await this.staffService.findIdDriver(id, key);

    if (!staffDriver) {
      throw new ServiceUnavailableException({
        message: '이 직원은 비활성화됩니다. 다른 직원을 선택해 주세요!',
        field_name: key,
        error: 'Service Unavailable',
        statusCode: 503,
      });
    }
  }

  async checkUnableStaffAgent(id: number, key: string, date: Date) {
    const staffAgent = await this.staffService.findIdAgent(id, key);
    if (
      !staffAgent ||
      moment(date).isBefore(staffAgent.start_date) ||
      (staffAgent.end_date &&
        !moment(date).isBetween(
          moment(staffAgent.start_date).subtract(1),
          moment(staffAgent.end_date).add(1),
        ))
    ) {
      throw new ServiceUnavailableException({
        message: '이 직원은 비활성화됩니다. 다른 직원을 선택해 주세요!',
        field_name: key,
        error: 'Bad Request',
        statusCode: 400,
      });
    }
  }

  async checkUnableStaff(data: {
    driver?: number;
    field_agent_1?: number;
    field_agent_2?: number;
    date?: Date;
  }) {
    if (data.driver !== undefined) {
      await this.checkUnableStaffDriver(data.driver, 'driver');
    }

    // if (data.backup_driver !== undefined) {
    //   await this.checkUnableStaffDriver(data.backup_driver, 'backup_driver');
    // }

    if (data.field_agent_1 !== undefined) {
      await this.checkUnableStaffAgent(
        data.field_agent_1,
        'field_agent_1',
        data.date,
      );
    }

    if (data.field_agent_2 !== undefined) {
      await this.checkUnableStaffAgent(
        data.field_agent_2,
        'field_agent_2',
        data.date,
      );
    }

    // if (data.backup_field_agent_1 !== undefined) {
    //   await this.checkUnableStaffAgent(
    //     data.backup_field_agent_1,
    //     'backup_field_agent_1',
    //   );
    // }

    // if (data.backup_field_agent_2 !== undefined) {
    //   await this.checkUnableStaffAgent(
    //     data.backup_field_agent_2,
    //     'backup_field_agent_2',
    //   );
    // }
  }

  async findByStaff(id: number) {
    if (id === null) return null;
    return await this.staffService.findOneById(id);
  }

  throwStaffUnavailable() {
    throw new BadRequestException({
      message: '이 직원은 비활성화됩니다. 다른 직원을 선택해 주세요!',
      error: 'Bad Request',
      statusCode: 400,
    });
  }
}
