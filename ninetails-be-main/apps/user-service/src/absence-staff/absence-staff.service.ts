import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Between, DataSource, Repository } from 'typeorm';
import {
  AbsenceStaffCreateForm,
  AbsenceStaffSearchForm,
  AbsenceStaffSearchReturnToWork,
  AbsenceStaffUpdateForm,
} from './absence-staff.dto';
import { AbsenceStaffEntity } from 'libs/entities/absence-staff.entity';
import { StaffService } from '../staff/staff.service';
import { JobContract, REPEAT } from 'libs/common/constants/common.constant';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import * as moment from 'moment';
import { forEach } from 'mathjs';
import { SORTASSTAFF } from 'libs/enums/common.enum';

@Injectable()
export class AbsenceStaffService {
  constructor(
    @Inject('ABSENCE_STAFF_REPO')
    private absenceStaffEntity: Repository<AbsenceStaffEntity>,
    private readonly staffService: StaffService,
    @Inject('WORKING_SCHEDULE_REPO')
    private workingScheduleEntity: Repository<WorkingScheduleEntity>,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
  ) {}

  async index(query: AbsenceStaffSearchForm) {
    const sortBy = query.sortBy.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const sortField =
      query.sortField === SORTASSTAFF.JOBCONTRACT
        ? 'id'
        : query.sortField ?? 'id';

    const [items, total] = await this.absenceStaffEntity
      .createQueryBuilder('af')
      .where({
        start_date: Between(query.start_date, query.end_date),
        ...(query.staff_id && { absence_staff_id: query.staff_id }),
      })
      .leftJoinAndSelect('af.absence_staff', 'absence_staff')
      .leftJoinAndSelect('af.replacer_staff', 'replacer_staff')
      .take(query.pageSize)
      .skip((query.page - 1) * query.pageSize)
      .orderBy(`af.${sortField}`, sortBy as any)
      .getManyAndCount();

    if (query.sortField === SORTASSTAFF.JOBCONTRACT) {
      items.sort((a, b) => {
        const jobContractA = a.absence_staff?.job_contract;
        const jobContractB = b.absence_staff?.job_contract;

        if (!jobContractA && !jobContractB) return 0;
        if (!jobContractA) return 1;
        if (!jobContractB) return -1;

        return sortBy === 'ASC'
          ? jobContractA.localeCompare(jobContractB)
          : jobContractB.localeCompare(jobContractA);
      });
    }

    return { items: items, total };
  }

  async create(input: AbsenceStaffCreateForm) {
    const [absenceStaff, replaceStaff] = await Promise.all([
      this.staffService.findOne(input.absence_staff.id),
      this.staffService.findOne(input.replacer_staff.id),
    ]);

    if (input.absence_staff.id === input.replacer_staff.id) {
      throw new BadRequestException(
        'Absence staff and replacement staff cannot be the same. Please choose another staff!',
      );
    }

    const jobCollect = [
      JobContract.COLLECT_CREW_FIXED_TERM,
      JobContract.COLLECT_CREW_MONTHLY,
      JobContract.COLLECT_CREW_REGULAR,
      JobContract.SUPPORT_CREW_FIXED_TERM,
      JobContract.SUPPORT_CREW_REGULAR,
    ];
    if (
      (absenceStaff.job_contract === JobContract.DRIVING_CREW_REGULAR &&
        replaceStaff.job_contract !== JobContract.DRIVING_CREW_REGULAR) ||
      (jobCollect.includes(absenceStaff.job_contract) &&
        !jobCollect.includes(replaceStaff.job_contract))
    ) {
      throw new BadRequestException(
        'This staff is unavailable. Please choose another staff!',
      );
    }
    input.start_date = moment(input.start_date).format(
      'YYYY-MM-DD 00:00:00',
    ) as any;
    input.end_date = moment(input.end_date)
      .utc()
      .format('YYYY-MM-DD 23:59:59') as any;
    const absenceStaffData = await this.findManyByIdStaff(
      input.absence_staff.id,
    );
    const datesOfStaff = await this.getAbsenceDates(absenceStaffData);

    const absenceReplaceData = await this.findManyByIdStaff(
      input.replacer_staff.id,
    );
    const datesOfReplacer = await this.getAbsenceDates(absenceReplaceData);

    const datesAbsenceForAbsenceStaff = new Set([
      ...new Set([...datesOfStaff]),
    ]);

    const datesAbsenceForReplaceStaff = new Set([
      ...new Set([...datesOfReplacer]),
    ]);

    const inputDates = await this.calculateAbsenceDays(input);

    const existingDatesForAbsenceStaff = inputDates.filter((date) =>
      datesAbsenceForAbsenceStaff.has(date),
    );
    //check existed absence date for absence staff
    if (existingDatesForAbsenceStaff.length > 0) {
      throw new BadRequestException(
        '이미 부재 설정된 인력입니다. 다른 인력을 선택해 주세요.',
      );
    }

    const existingDatesForReplaceStaff = inputDates.filter((date) =>
      datesAbsenceForReplaceStaff.has(date),
    );
    //check existed absence date for replace staff
    if (existingDatesForReplaceStaff.length > 0) {
      throw new BadRequestException(
        '이미 부재 설정된 대체 인력입니다. 다른 대체 인력을 선택해 주세요.',
      );
    }

    //check operation staff end_date
    if (
      (absenceStaff.end_date &&
        new Date(absenceStaff.end_date) <= new Date(input.end_date)) ||
      (replaceStaff.end_date &&
        new Date(replaceStaff.end_date) <= new Date(input.end_date))
    ) {
      throw new BadRequestException(
        'This staff is unavailable. Please choose another staff!',
      );
    }

    const entity = this.absenceStaffEntity.create(input);
    if (input.repeat == REPEAT.WEEKLY) {
      entity.repeat_days_week = input.days.join(',');
      const startWeek = moment(input.start_date).startOf('week');
      const endWeek = moment(input.end_date).startOf('week');
      const weeks = endWeek.diff(startWeek, 'week', true);
      const dates = [];
      for (let i = 0; i <= weeks; i++) {
        for (const day of input.days) {
          const indexDay = [
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
          ].findIndex((i) => i === day);
          const dateOfDay = moment(input.start_date)
            .startOf('week')
            .add(i, 'week')
            .day(indexDay + 1)
            .format('YYYY-MM-DD 00:00:00');
          dates.push(dateOfDay);
        }
      }
      await this.updateWorkShiftForRepeat(
        dates,
        absenceStaff.id,
        replaceStaff.id,
      );
    } else if (input.repeat == REPEAT.MONTHLY) {
      entity.repeat_days_month = input.days.join(',');
      const startMonth = moment(input.start_date).startOf('month');
      const endMonth = moment(input.end_date).startOf('month');
      const months = endMonth.diff(startMonth, 'month', true);
      const dates = [];
      for (let i = 0; i <= months; i++) {
        for (const day of input.days) {
          const dateOfDay = moment(startMonth)
            .add(i, 'month')
            .add(+day - 1, 'day')
            .format('YYYY-MM-DD 00:00:00');
          dates.push(dateOfDay);
        }
      }
      await this.updateWorkShiftForRepeat(
        dates,
        absenceStaff.id,
        replaceStaff.id,
      );
    } else {
      const startDate = moment(input.start_date)
        .startOf('day')
        .format('YYYY-MM-DD HH:mm:ss');
      const endDate = moment(input.end_date)
        .endOf('day')
        .format('YYYY-MM-DD HH:mm:ss.SSS');
      const where = `w.working_date BETWEEN '${startDate}'::timestamp AND '${endDate}'::timestamp 
      and (w.driver = ${replaceStaff.id} or w.backup_driver = ${replaceStaff.id} or 
      w.field_agent_1 = ${replaceStaff.id} or w.backup_field_agent_1 = ${replaceStaff.id} or 
      w.field_agent_2 = ${replaceStaff.id} or w.backup_field_agent_2 = ${replaceStaff.id} or 
      w.backup_driver = ${absenceStaff.id} or w.backup_field_agent_1 = ${absenceStaff.id} or 
      w.backup_field_agent_2 = ${absenceStaff.id})`;
      // if (absenceStaff.job_contract === JobContract.DRIVING_CREW_REGULAR) {
      //   where += ` and w.driver = ${absenceStaff.id}`;
      // } else if (jobCollect.includes(absenceStaff.job_contract)) {
      //   where += ` and (w.field_agent_1 = ${absenceStaff.id} or w.field_agent_2 = ${absenceStaff.id})`;
      // }
      const check = await this.workingScheduleEntity
        .createQueryBuilder('w')
        .where(where)
        .getOne();
      if (check) {
        throw new BadRequestException(
          '이미 부재 설정된 대체 인력입니다. 다른 대체 인력을 선택해 주세요.',
        );
      }
      const workShifts = await this.workingScheduleEntity
        .createQueryBuilder('w')
        .where(
          `w.working_date BETWEEN '${startDate}'::timestamp AND '${endDate}'::timestamp and 
          (w.driver = ${absenceStaff.id} or w.field_agent_1 = ${absenceStaff.id} or w.field_agent_2 = ${absenceStaff.id})`,
        )
        .getMany();
      await this.updateWorkShift(workShifts, absenceStaff.id, replaceStaff.id);
    }
    const absenceCreate = await this.absenceStaffEntity.save(entity);
    return await this.absenceStaffEntity.findOne({
      where: { id: absenceCreate.id },
      relations: ['absence_staff', 'replacer_staff'],
    });
  }

  async updateWorkShiftForRepeat(
    dates: string[],
    absenceStaffId: number,
    replacerId: number,
  ) {
    const datesStr = dates.map((d) => `'${d}'::timestamp`);
    const check = await this.workingScheduleEntity
      .createQueryBuilder('w')
      .where(
        `w.working_date in (${datesStr.join(',')}) and 
        (w.driver = ${replacerId} or w.backup_driver = ${replacerId} or 
        w.field_agent_1 = ${replacerId} or w.backup_field_agent_1 = ${replacerId} or 
        w.field_agent_2 = ${replacerId} or w.backup_field_agent_2 = ${replacerId} or 
        w.backup_driver = ${absenceStaffId} or w.backup_field_agent_1 = ${absenceStaffId} or 
        w.backup_field_agent_2 = ${absenceStaffId})`,
      )
      .getOne();
    if (check) {
      throw new BadRequestException(
        '이미 부재 설정된 대체 인력입니다. 다른 대체 인력을 선택해 주세요.',
      );
    }
    const workShifts = await this.workingScheduleEntity
      .createQueryBuilder('w')
      .where(
        `w.working_date in (${datesStr.join(',')}) and 
        (w.driver = ${absenceStaffId} or  
        w.field_agent_1 = ${absenceStaffId} or w.field_agent_2 = ${absenceStaffId})`,
      )
      .getMany();
    await this.updateWorkShift(workShifts, absenceStaffId, replacerId);
  }

  async updateWorkShift(
    workShifts: WorkingScheduleEntity[],
    absenceStaffId: number,
    replacerId: number,
  ) {
    for (const workShift of workShifts) {
      const updateData: {
        backup_driver?: number;
        backup_field_agent_1?: number;
        backup_field_agent_2?: number;
      } = {};
      if (workShift.driver === absenceStaffId) {
        updateData.backup_driver = replacerId;
      } else if (workShift.field_agent_1 === absenceStaffId) {
        updateData.backup_field_agent_1 = replacerId;
      } else if (workShift.field_agent_2 === absenceStaffId) {
        updateData.backup_field_agent_2 = replacerId;
      } else {
        continue;
      }
      await this.workingScheduleEntity.update({ id: workShift.id }, updateData);
    }
  }

  async update(id: number, input: AbsenceStaffUpdateForm) {
    const existingAbsence = await this.findOne(id);

    if (input.replacer_staff.id === existingAbsence.absence_staff_id) {
      throw new BadRequestException(
        'Replacement staff cannot be the same as absence staff. Please choose another staff!',
      );
    }

    const [absenceStaff, replaceStaff] = await Promise.all([
      this.staffService.findOne(existingAbsence.absence_staff_id),
      this.staffService.findOne(input.replacer_staff.id),
    ]);

    input.start_date = moment(input.start_date).format(
      'YYYY-MM-DD 00:00:00',
    ) as any;
    input.end_date = moment(input.end_date)
      .utc()
      .format('YYYY-MM-DD 23:59:59') as any;

    const absenceStaffData = await this.findManyByIdStaffEdit(
      existingAbsence.absence_staff_id,
      id,
    );
    const datesOfStaff = await this.getAbsenceDates(absenceStaffData);

    const absenceReplaceData = await this.findManyByIdStaffEdit(
      input.replacer_staff.id,
      id,
    );

    const datesOfReplacer = await this.getAbsenceDates(absenceReplaceData);

    const datesAbsenceForAbsenceStaff = new Set([
      ...new Set([...datesOfStaff]),
    ]);

    const datesAbsenceForReplaceStaff = new Set([
      ...new Set([...datesOfReplacer]),
    ]);

    const inputDates = await this.calculateAbsenceDays(input);

    const existingDatesForAbsenceStaff = inputDates.filter((date) =>
      datesAbsenceForAbsenceStaff.has(date),
    );
    //check existed absence date for absence staff
    if (existingDatesForAbsenceStaff.length > 0) {
      throw new BadRequestException(
        '이미 부재 설정된 인력입니다. 다른 인력을 선택해 주세요.',
      );
    }

    const existingDatesForReplaceStaff = inputDates.filter((date) =>
      datesAbsenceForReplaceStaff.has(date),
    );
    //check existed absence date for replace staff
    if (existingDatesForReplaceStaff.length > 0) {
      throw new BadRequestException(
        '이미 부재 설정된 대체 인력입니다. 다른 대체 인력을 선택해 주세요.',
      );
    }

    if (
      (absenceStaff.end_date &&
        new Date(absenceStaff.end_date) <= new Date(input.end_date)) ||
      (replaceStaff.end_date &&
        new Date(replaceStaff.end_date) <= new Date(input.end_date))
    ) {
      throw new BadRequestException(
        'This staff is unavailable. Please choose another staff!',
      );
    }

    try {
      const { days, ...updateData }: any = {
        ...existingAbsence,
        ...input,
      };

      if (input.repeat === REPEAT.WEEKLY) {
        updateData.repeat_days_week = input.days.join(',');
        updateData.repeat_days_month = null;
      }

      if (input.repeat === REPEAT.MONTHLY) {
        updateData.repeat_days_month = input.days.join(',');
        updateData.repeat_days_week = null;
      }

      await this.absenceStaffEntity.update(id, updateData);
      return await this.absenceStaffEntity.findOne({
        where: { id: id },
        relations: ['absence_staff', 'replacer_staff'],
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Something went wrong. Please try again!');
    }
  }

  async delete(id: number) {
    const data = await this.absenceStaffEntity.delete(id);

    if (!data.affected) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }

    return true;
  }

  async findOne(id: number) {
    const absenceStaff = await this.absenceStaffEntity.findOne({
      where: { id: id },
    });
    if (!absenceStaff) {
      throw new NotFoundException('Absence Staff Not Found');
    }
    return absenceStaff;
  }

  async deleteMany(ids: number[]) {
    const data = await this.absenceStaffEntity
      .createQueryBuilder()
      .where('id IN(:...ids)', { ids })
      .delete()
      .execute();

    if (!data.affected) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }

    return data.affected;
  }

  async findManyByIdStaff(id: number) {
    const query = this.absenceStaffEntity
      .createQueryBuilder()
      .where('replacer_staff_id = :id OR absence_staff_id = :id', { id });

    return await query.getMany();
  }

  async findManyByIdStaffEdit(id: number, idAbsence: number) {
    const query = this.absenceStaffEntity
      .createQueryBuilder()
      .where('(replacer_staff_id = :id OR absence_staff_id = :id)', { id })
      .andWhere('id != :idAbsence', { idAbsence });

    return await query.getMany();
  }

  async getAbsenceDates(absences: any) {
    const formatDate = (date: Date) => moment(date).format('DD-MM-YYYY');
    const result: string[] = [];

    absences.forEach((absence) => {
      const absenceDates: string[] = [];

      const today = moment().startOf('day');
      const startDate = moment(absence.start_date).startOf('day');
      const endDate = moment(absence.end_date).endOf('day');

      if (absence.repeat === REPEAT.WEEKLY && absence.repeat_days_week) {
        const repeatDays = absence.repeat_days_week.split(',');

        repeatDays.forEach((day) => {
          const dayIndex = [
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
          ].findIndex((d) => d === day);

          if (dayIndex >= 0) {
            let potentialDate = moment(absence.start_date)
              .startOf('week')
              .add(dayIndex + 1, 'days');

            while (potentialDate.isSameOrBefore(endDate)) {
              if (
                potentialDate.isSameOrAfter(startDate) &&
                potentialDate.isSameOrAfter(today)
              ) {
                absenceDates.push(formatDate(potentialDate.toDate()));
              }
              potentialDate = potentialDate.add(1, 'weeks');
            }
          }
        });
      }

      if (absence.repeat === REPEAT.MONTHLY && absence.repeat_days_month) {
        const repeatDays = absence.repeat_days_month.split(',').map(Number);
        let currentMonth = startDate.clone().startOf('month');

        while (currentMonth.isSameOrBefore(endDate, 'month')) {
          repeatDays.forEach((day) => {
            const potentialDate = currentMonth.clone().date(day);

            if (
              potentialDate.isSameOrAfter(startDate) &&
              potentialDate.isSameOrAfter(today) &&
              potentialDate.isSameOrBefore(endDate)
            ) {
              absenceDates.push(formatDate(potentialDate.toDate()));
            }
          });
          currentMonth = currentMonth.add(1, 'month');
        }
      }

      if (absence.repeat === REPEAT.NONE) {
        let currentDay = startDate.clone();

        while (currentDay.isSameOrBefore(endDate)) {
          absenceDates.push(formatDate(currentDay.toDate()));
          currentDay = currentDay.add(1, 'days');
        }
      }

      result.push(...new Set(absenceDates));
    });

    return Array.from(new Set(result)).sort();
  }

  async calculateAbsenceDays(absence: any) {
    const formatDate = (date: Date) => moment(date).format('DD-MM-YYYY');
    const absenceDates: string[] = [];

    const startDate = moment(absence.start_date).startOf('day');
    const endDate = moment(absence.end_date).endOf('day');
    const today = moment().startOf('day');

    if (absence.repeat === REPEAT.NONE) {
      let currentDay = startDate.clone();

      while (currentDay.isSameOrBefore(endDate)) {
        absenceDates.push(formatDate(currentDay.toDate()));
        currentDay = currentDay.add(1, 'days');
      }
    }

    if (absence.repeat === REPEAT.WEEKLY && absence.days) {
      const repeatDays = absence.days;

      repeatDays.forEach((day: string) => {
        const dayIndex = [
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
        ].findIndex((d) => d === day.toUpperCase());

        if (dayIndex >= 0) {
          let potentialDate = moment(absence.start_date)
            .startOf('week')
            .add(dayIndex, 'days');

          while (potentialDate.isSameOrBefore(endDate)) {
            if (
              potentialDate.isSameOrAfter(startDate) &&
              potentialDate.isSameOrAfter(today)
            ) {
              absenceDates.push(formatDate(potentialDate.toDate()));
            }
            potentialDate = potentialDate.add(1, 'weeks');
          }
        }
      });
    }

    if (absence.repeat === REPEAT.MONTHLY && absence.days) {
      const repeatDays = absence.days.map((day: any) => Number(day));
      let currentMonth = startDate.clone().startOf('month');

      while (currentMonth.isSameOrBefore(endDate, 'month')) {
        repeatDays.forEach((day) => {
          const potentialDate = currentMonth.clone().date(day);

          if (
            potentialDate.isSameOrAfter(startDate) &&
            potentialDate.isSameOrAfter(today) &&
            potentialDate.isSameOrBefore(endDate)
          ) {
            absenceDates.push(formatDate(potentialDate.toDate()));
          }
        });
        currentMonth = currentMonth.add(1, 'month');
      }
    }

    return Array.from(new Set(absenceDates)).sort();
  }

  async backToWork(query: AbsenceStaffSearchReturnToWork) {
    const dateSubtract = moment(query.date)
      .subtract(1, 'days')
      .format('YYYY-MM-DD');
    const absences = await this.absenceStaffEntity
      .createQueryBuilder('af')
      .where('af.start_date <= :date', { date: query.date })
      .andWhere('af.end_date >= :adjustedDate', { adjustedDate: dateSubtract })
      .leftJoinAndSelect('af.absence_staff', 'absence_staff')
      .getMany();

    const result = absences.map((absence) => {
      const today = moment(dateSubtract).startOf('day');
      const startDate = moment(absence.start_date).startOf('day');
      const endDate = moment(absence.end_date).endOf('day');
      const futureAbsenceDates: string[] = [];

      if (absence.repeat === REPEAT.WEEKLY && absence.repeat_days_week) {
        const repeatDays = absence.repeat_days_week.split(',');
        repeatDays.forEach((day) => {
          const dayIndex = [
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
          ].indexOf(day);

          if (dayIndex >= 0) {
            const potentialDate = today
              .clone()
              .startOf('week')
              .add(dayIndex + 1, 'days');
            if (potentialDate.isBefore(today)) {
              potentialDate.add(1, 'weeks');
            }

            while (potentialDate.isSameOrBefore(endDate)) {
              futureAbsenceDates.push(potentialDate.format('YYYY-MM-DD'));
              potentialDate.add(1, 'weeks');
            }
          }
        });
      }
      if (absence.repeat === REPEAT.MONTHLY && absence.repeat_days_month) {
        const repeatDays = absence.repeat_days_month.split(',').map(Number);
        const currentMonth = today.clone().startOf('month');

        while (currentMonth.isSameOrBefore(endDate, 'month')) {
          repeatDays.forEach((day) => {
            const potentialDate = currentMonth.clone().date(day);
            if (
              potentialDate.isBetween(today, endDate, 'day', '[]') &&
              !futureAbsenceDates.includes(potentialDate.format('YYYY-MM-DD'))
            ) {
              futureAbsenceDates.push(potentialDate.format('YYYY-MM-DD'));
            }
          });
          currentMonth.add(1, 'month');
        }
      }
      if (absence.repeat === REPEAT.NONE) {
        const current = moment.max(today, startDate);
        while (current.isSameOrBefore(endDate)) {
          futureAbsenceDates.push(current.format('YYYY-MM-DD'));
          current.add(1, 'days');
        }
      }

      futureAbsenceDates.sort(
        (a, b) =>
          moment(a, 'YYYY-MM-DD').date() - moment(b, 'YYYY-MM-DD').date(),
      );

      let backToWorkDate = null;
      for (let i = 0; i < futureAbsenceDates.length; i++) {
        const futureAbsenceDate = futureAbsenceDates[i];
        if (futureAbsenceDate) {
          const futureDateMoment = moment(futureAbsenceDate);
          const nextDate = futureDateMoment.add(1, 'days').format('YYYY-MM-DD');
          if (!futureAbsenceDates.includes(nextDate)) {
            backToWorkDate = nextDate;
            break;
          }
        }
      }

      return {
        ...absence,
        absence_dates: futureAbsenceDates,
        absence_staff: absence.absence_staff,
        back_to_work: backToWorkDate,
      };
    });

    return result.sort((a, b) =>
      moment(a.absence_dates[0]).diff(moment(b.absence_dates[0])),
    );
  }

  async detail(id: number) {
    const absenceStaff = await this.absenceStaffEntity
      .createQueryBuilder('af')
      .where('af.id = :id', { id })
      .leftJoinAndSelect('af.absence_staff', 'absence_staff')
      .leftJoinAndSelect('af.replacer_staff', 'replacer_staff')
      .getOne();

    if (!absenceStaff) {
      throw new NotFoundException(`Absence staff not found.`);
    }

    return absenceStaff;
  }
}
