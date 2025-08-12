import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StaffEntity } from 'libs/entities/staff.entity';
import { DataSource, In, Not, Repository } from 'typeorm';
import {
  CreateStaffReq,
  DeleteStaffReq,
  SearchStaffReq,
  UpdateStaffReq,
} from '../dto/staff.dto';
import { ComboBoxService } from '../combo-box/combo-box.service';
import {
  DriverLicense,
  JobContract,
  REPEAT,
  StaffStatus,
} from 'libs/common/constants/common.constant';
import * as moment from 'moment';
import { ESORTSTAFF } from 'libs/enums/common.enum';

@Injectable()
export class StaffService {
  constructor(
    @Inject('STAFF_REPO') private staffEntity: Repository<StaffEntity>,
    private comboBoxService: ComboBoxService,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
  ) {}

  async getAll(data: SearchStaffReq) {
    await this.checkStatusStaffs();
    const query = this.staffEntity
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.absence_staff', 'absence_staff')
      .leftJoinAndSelect('absence_staff.replacer_staff', 'replacer_staff');

    if (data.name) {
      query.where('staff.name LIKE :name', { name: `%${data.name ?? ''}%` });
    }

    if (data.status !== undefined) {
      query.andWhere('staff.status = :status', { status: data.status });
    }

    if (data.driver_license != undefined) {
      query.andWhere('staff.driver_license = :driver_license', {
        driver_license: data.driver_license,
      });
    }

    if (data.job_contract) {
      const jobContracts = Array.isArray(data.job_contract)
        ? data.job_contract
        : [data.job_contract];

      query.andWhere('staff.job_contract IN (:...job_contract)', {
        job_contract: jobContracts,
      });
    }

    const sortField = data.sortField ?? 'id';
    let sortBy = data.sortBy.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let absenceSort =
      sortField === ESORTSTAFF.ABSENCEDATE ||
      sortField === ESORTSTAFF.ABSENCETYPE ||
      sortField === ESORTSTAFF.REPLACESTAFF
        ? undefined
        : `staff.${sortField}`;

    const [staffs, total] = await query
      .take(data.pageSize)
      .skip((data.page - 1) * data.pageSize)
      .orderBy(absenceSort, sortBy as any)
      .getManyAndCount();

    const newStaff = await this.findClosestReplacer(staffs);

    if (sortField === ESORTSTAFF.ABSENCEDATE) {
      newStaff.sort((a, b) => {
        const absenceDateA = a.absence_staff?.absence_date;
        const absenceDateB = b.absence_staff?.absence_date;

        if (!absenceDateA && !absenceDateB) return 0;
        if (!absenceDateA) return 1;
        if (!absenceDateB) return -1;

        return sortBy === 'ASC'
          ? new Date(absenceDateA).getTime() - new Date(absenceDateB).getTime()
          : new Date(absenceDateB).getTime() - new Date(absenceDateA).getTime();
      });
    }

    if (sortField === ESORTSTAFF.ABSENCETYPE) {
      newStaff.sort((a, b) => {
        const absenceTypeA = a.absence_staff?.absence_type;
        const absenceTypeB = b.absence_staff?.absence_type;

        if (!absenceTypeA && !absenceTypeB) return 0;
        if (!absenceTypeA) return 1;
        if (!absenceTypeB) return -1;

        return sortBy === 'ASC'
          ? absenceTypeA.localeCompare(absenceTypeB)
          : absenceTypeB.localeCompare(absenceTypeA);
      });
    }

    if (sortField === ESORTSTAFF.REPLACESTAFF) {
      newStaff.sort((a, b) => {
        const absenceReplacerA = a.absence_staff?.replacer_staff?.name;
        const absenceReplacerB = b.absence_staff?.replacer_staff?.name;

        if (!absenceReplacerA && !absenceReplacerB) return 0;
        if (!absenceReplacerA) return 1;
        if (!absenceReplacerB) return -1;

        return sortBy === 'ASC'
          ? absenceReplacerA.localeCompare(absenceReplacerB)
          : absenceReplacerB.localeCompare(absenceReplacerA);
      });
    }

    return { staffs: newStaff, total };
  }

  async findClosestReplacer(staffs: any) {
    staffs.forEach((staff) => {
      let closestReplacer = null;
      let closestDate = null;
      let closestAbsence = null;

      staff.absence_staff.forEach((absence) => {
        let potentialDate = null;

        if (absence.repeat === REPEAT.WEEKLY && absence.repeat_days_week) {
          const repeatDays = absence.repeat_days_week.split(',');
          const today = moment().startOf('day');
          const startDate = moment(absence.start_date).startOf('day');
          const endDate = moment(absence.end_date).endOf('day');

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
              let potentialWeek = moment(absence.start_date)
                .startOf('week')
                .add(dayIndex + 1, 'days');

              while (potentialWeek.isBefore(today)) {
                potentialWeek = potentialWeek.add(1, 'weeks');
              }

              potentialDate = potentialWeek.toDate();

              if (
                potentialDate &&
                moment(potentialDate).isSameOrAfter(today) &&
                moment(potentialDate).isSameOrAfter(startDate) &&
                moment(potentialDate).isSameOrBefore(endDate)
              ) {
                if (
                  !closestDate ||
                  moment(potentialDate).isBefore(closestDate)
                ) {
                  closestDate = potentialDate;
                  closestReplacer = absence.replacer_staff;
                  closestAbsence = absence;
                }
              }
            }
          });
        }

        if (absence.repeat === REPEAT.MONTHLY && absence.repeat_days_month) {
          const repeatDays = absence.repeat_days_month.split(',').map(Number);
          const today = moment().startOf('day');
          const startDate = moment(absence.start_date).startOf('day');
          const endDate = moment(absence.end_date).endOf('day');

          let currentMonth = moment(absence.start_date).startOf('month');

          while (currentMonth.isSameOrBefore(endDate, 'month')) {
            repeatDays.forEach((day) => {
              let potentialMonth = currentMonth.clone().date(day);

              if (
                potentialMonth.isSameOrAfter(startDate) &&
                potentialMonth.isSameOrBefore(endDate)
              ) {
                const potentialDate = potentialMonth.toDate();

                if (
                  moment(potentialDate).isSameOrAfter(today) &&
                  moment(potentialDate).isSameOrAfter(startDate) &&
                  moment(potentialDate).isSameOrBefore(endDate)
                ) {
                  if (
                    !closestDate ||
                    moment(potentialDate).isBefore(closestDate)
                  ) {
                    closestDate = potentialDate;
                    closestReplacer = absence.replacer_staff;
                    closestAbsence = absence;
                  }
                }
              }
            });

            currentMonth = currentMonth.add(1, 'month');
          }
        }

        if (absence.repeat === REPEAT.NONE) {
          const today = moment().startOf('day');
          const startDate = moment(absence.start_date).startOf('day');
          const endDate = moment(absence.end_date).endOf('day');

          if (today.isSameOrAfter(startDate) && today.isSameOrBefore(endDate)) {
            potentialDate = today.toDate();
          } else if (today.isBefore(startDate)) {
            potentialDate = startDate.toDate();
          } else if (today.isAfter(endDate)) {
            potentialDate = null;
          }

          if (
            potentialDate &&
            (!closestDate || moment(potentialDate).isBefore(closestDate))
          ) {
            closestDate = potentialDate;
            closestReplacer = absence.replacer_staff;
            closestAbsence = absence;
          }
        }
      });

      if (
        closestReplacer &&
        closestDate &&
        moment(closestDate).isSameOrAfter(moment().startOf('day'))
      ) {
        staff.absence_staff = {
          ...closestAbsence,
          replacer_staff_id: closestReplacer.id,
          replacer_staff: closestReplacer,
          absence_date: closestDate,
        };
      } else {
        staff.absence_staff = null;
      }
    });

    return staffs;
  }

  async detail(id: number) {
    return await this.findOne(id);
  }

  async create(data: CreateStaffReq) {
    const staffData = this.staffEntity.create(data as any);
    return this.staffEntity.save(staffData);
  }

  async findOne(id: number) {
    const staffData = await this.staffEntity.findOneBy({ id });
    if (!staffData) {
      throw new NotFoundException('Staff Not Found');
    }
    return staffData;
  }

  async update(id: number, updateStaffReq: UpdateStaffReq, schema: string) {
    await this.findOne(id);

    const [closestAbsenceStaff] = await this.findAbsenceStaffId([id], schema);

    if (closestAbsenceStaff) {
      const inputEndDate = new Date(updateStaffReq.end_date);
      const absenceEndDate = new Date(closestAbsenceStaff.end_date);

      if (inputEndDate < absenceEndDate) {
        throw new BadRequestException('Please select a valid time period.');
      }
    }

    await this.staffEntity.update({ id }, updateStaffReq as any);
    return await this.findOne(id);
  }

  async delete(body: DeleteStaffReq, schema: string) {
    await this.findStaffId(body.id, schema);

    for (const id of body.id) {
      const staff = await this.findOne(id);
      if (staff) {
        await this.staffEntity.softDelete(id);
      }
    }
    return { message: 'Deletion process completed.' };
  }

  async findIdDriver(id: number, key: string) {
    const staff = await this.staffEntity.findOneBy({
      id: id,
      job_contract: In([
        JobContract.DRIVING_CREW_REGULAR,
        JobContract.SUPPORT_CREW_FIXED_TERM,
        JobContract.SUPPORT_CREW_REGULAR,
      ]),
      status: StaffStatus.NORMAL,
    });
    if (!staff) {
      throw new BadRequestException({
        // message: 'This staff is unavailable. Please choose another staff!',
        message: '이 직원은 비활성화됩니다. 다른 직원을 선택해 주세요!',
        field_name: key,
        error: 'Bad Request',
        statusCode: 400,
      });
    }
    return staff;
  }

  async findIdAgent(id: number, key: string) {
    const staff = await this.staffEntity.findOneBy({
      id: id,
      job_contract: In([
        JobContract.COLLECT_CREW_FIXED_TERM,
        JobContract.COLLECT_CREW_MONTHLY,
        JobContract.COLLECT_CREW_REGULAR,
      ]),
    });
    if (!staff) {
      throw new BadRequestException({
        // message: 'This staff is unavailable. Please choose another staff!',
        message: '이 직원은 비활성화됩니다. 다른 직원을 선택해 주세요!',
        field_name: key,
        error: 'Bad Request',
        statusCode: 400,
      });
    }
    return staff;
  }

  async findOneById(id: number) {
    return await this.staffEntity.findOneBy({
      id: id,
    });
  }

  async findByIds(ids: number[]) {
    const staffData = await this.staffEntity.findBy({
      id: In(ids),
    });

    if (staffData.length === 0) {
      throw new NotFoundException('Staff Not Found');
    }
    return staffData;
  }

  // async dataFetchedAbsence(data: any) {
  //   await this.staffEntity.update(
  //     { id: data.id },
  //     {
  //       absence_staff_id: data.id,
  //     },
  //   );
  // }

  async ignoreResignedStatus() {
    return await this.staffEntity.find({
      where: {
        status: Not(StaffStatus.RESIGNED),
      },
    });
  }

  async findStaffId(ids: any, schema: string) {
    const time = moment().startOf('day').toISOString();
    const query = `SELECT * FROM "${schema}".absence_staff 
    WHERE (absence_staff_id = ANY($1) OR replacer_staff_id = ANY($1)) and end_date > '${time}' 
    AND deleted_at IS NULL`;
    const result = await this.dataSource.query(query, [ids]);

    if (result.length > 0) {
      throw new BadRequestException(
        // 'Unable to delete this Staff. Please try another one!',
        '이 직원 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
      );
    }
  }

  async checkStatusStaffs() {
    const staffAbsence = await this.checkAbsenceDate();
    const today = moment(new Date()).format('YYYY-MM-DD');
    for (const staff of staffAbsence) {
      const staffAbsenceDate = staff.absence_date
        ? moment(staff.absence_date).format('YYYY-MM-DD')
        : null;

      const endDate = staff.end_date
        ? moment(staff.end_date).format('YYYY-MM-DD')
        : today;

      const id = staff.id;

      if (today == staffAbsenceDate) {
        await this.staffEntity.update({ id }, { status: StaffStatus.LEAVING });
      }

      if (staffAbsenceDate == null) {
        await this.staffEntity.update({ id }, { status: StaffStatus.NORMAL });
      }

      if (endDate < today) {
        await this.staffEntity.update({ id }, { status: StaffStatus.RESIGNED });
      }
    }
  }

  async checkAbsenceDate() {
    const staffs = await this.staffEntity
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.absence_staff', 'absence_staff')
      .leftJoinAndSelect('absence_staff.replacer_staff', 'replacer_staff')
      .getMany();

    const staffLists = await this.findClosestReplacer(staffs);

    return staffLists.map((staff) => {
      const updatedStaff = { ...staff };
      updatedStaff.absence_date = staff.absence_staff?.absence_date || null;

      delete updatedStaff.absence_staff;
      return updatedStaff;
    });
  }

  async findAbsenceStaffId(ids: any, schema: string) {
    const query = `
    SELECT * 
    FROM "${schema}".absence_staff 
    WHERE 
      (absence_staff_id = ANY($1) OR replacer_staff_id = ANY($1)) 
      AND deleted_at IS NULL
      AND end_date >= NOW()
    ORDER BY end_date ASC
    LIMIT 1
  `;
    const result = await this.dataSource.query(query, [ids]);

    return result;
  }
}
