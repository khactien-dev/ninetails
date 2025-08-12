import { Inject } from '@nestjs/common';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { SearchWorkingScheduleReq } from '../dto/working-schedule.dto';
import { AbsenceStaffEntity } from 'libs/entities/absence-staff.entity';
import * as moment from 'moment';
import { REPEAT } from 'libs/common/constants/common.constant';

export class StatisticService {
  constructor(
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    @Inject('WORKING_SCHEDULE_REPO')
    private workingScheduleEntity: Repository<WorkingScheduleEntity>,
    @Inject('ABSENCE_STAFF_REPO')
    private absenceStaffEntity: Repository<AbsenceStaffEntity>,
  ) {}

  async statictic(data: SearchWorkingScheduleReq, total: number) {
    data.working_date = moment(data.working_date).format(
      'YYYY-MM-DD 00:00:00',
    ) as any;
    const collectorAvailableStr = `
    SELECT s.id, s.name, ab.absence_type, ab.repeat, ab.start_date, ab.end_date, ab.id as aid 
    FROM "${data.schema}".staff s left join "${data.schema}".absence_staff ab 
    on ab.absence_staff_id = s.id and ab.deleted_at is null  
    WHERE NOT EXISTS (
      SELECT 1 FROM "${data.schema}".dispatches w 
      WHERE w.date = '${data.working_date}'::timestamp and 
      (w.crew1_id = s.id OR w.crew2_id = s.id OR w.driver_id = s.id or w.alt_driver_id = s.id 
      OR w.alt_crew1_id = s.id OR w.alt_crew2_id = s.id) and w.deleted_at is null
    ) and NOT EXISTS (
      SELECT 1 FROM "${data.schema}".absence_staff a 
      WHERE '${data.working_date}'::timestamp BETWEEN a.start_date AND a.end_date 
      and a.repeat = 'NONE' and (a.absence_staff_id = s.id) and a.deleted_at is null
    ) and ('${data.working_date}'::timestamp between s.start_date and s.end_date or 
      (s.start_date < '${data.working_date}'::timestamp and s.end_date is null)) and s.job_contract = `;
    const [
      vehicleBackupCount,
      driverBackupCount,
      agent1BackupCount,
      agent2BackupCount,
      sumNonCollectDistance,
      sumSectionDistance,
      staffActiveCount,
      vehicleAvailableCount,
      vehicleActiveCount,
      vehicleAbsenceCount,
      vehicleAbsenceCompositeR,
      vehicleAbsenceCompositeS,
      vehicleAbsenceFoodR,
      vehicleAbsenceFoodS,
      vehicleAbsenceReusableR,
      vehicleAbsenceReusableS,
      vehicleAbsenceTaticR,
      vehicleAbsenceTaticS,
      driverAbsence,
      collectFixAbsence,
      collectRegularAbsence,
      collectMonthAbsence,
      supportRegularAbsence,
      supportFixAbsence,
      driverAvailable,
      collectRegularAvailable,
      collectMonthAvailable,
      collectFixAvailable,
      supportRegularAvailable,
      supportFixAvailable,
      vehicleAvailable,
    ] = await Promise.all([
      this.workingScheduleEntity.count({
        where: {
          backup_vehicle_id: Not(IsNull()),
          working_date: data.working_date,
          [data.purpose ? 'purpose' : undefined]: data.purpose,
        },
      }),
      this.workingScheduleEntity.count({
        where: {
          backup_driver: Not(IsNull()),
          working_date: data.working_date,
          [data.purpose ? 'purpose' : undefined]: data.purpose,
        },
      }),
      this.workingScheduleEntity.count({
        where: {
          backup_field_agent_1: Not(IsNull()),
          working_date: data.working_date,
          [data.purpose ? 'purpose' : undefined]: data.purpose,
        },
      }),
      this.workingScheduleEntity.count({
        where: {
          backup_field_agent_2: Not(IsNull()),
          working_date: data.working_date,
          [data.purpose ? 'purpose' : undefined]: data.purpose,
        },
      }),
      this.dataSource.query(
        `SELECT sum(s.distance) FROM "${data.schema}".dispatches w 
        left join "${data.schema}".routes r on w.route_id = r.id and r.deleted_at is null 
        left join "${data.schema}".core_sections cs on cs.route_id = r.id and cs.deleted_at is null 
        left join "${data.schema}".segments s on s.id = cs.segment_id and s.deleted_at is null 
        where w.date = '${data.working_date}'::timestamp and 
        cs.type in ('LANDFILL', 'GARAGE') and w.deleted_at is null 
        ${data.purpose ? `and purpose = '${data.purpose}' group by w.purpose` : ''}`,
      ),
      this.dataSource.query(
        `SELECT sum(s.distance) FROM "${data.schema}".dispatches w 
        left join "${data.schema}".sections s on s.route_id = w.route_id and s.deleted_at is null 
        where w.date = '${data.working_date}'::timestamp
        ${data.purpose ? `and route_type = '${data.purpose}' and w.deleted_at is null group by w.purpose` : ''}`,
      ),
      this.dataSource.query(
        `SELECT count(*), s.job_contract 
        FROM "${data.schema}".staff s
        WHERE EXISTS (
          SELECT 1 FROM "${data.schema}".dispatches w
          WHERE w.date = '${data.working_date}'::timestamp and 
          (w.driver_id = s.id OR w.crew1_id = s.id OR w.crew2_id = s.id
          or w.alt_driver_id = s.id OR w.alt_crew1_id = s.id OR w.alt_crew2_id = s.id) and w.deleted_at is null
        ) and s.deleted_at is null group by s.job_contract`,
      ),
      this.dataSource.query(
        `SELECT count(*), v.purpose FROM "${data.schema}".vehicle v 
        WHERE not EXISTS (
          SELECT 1 FROM "${data.schema}".dispatches w
          WHERE w.date = '${data.working_date}'::timestamp 
          and (w.vehicle_id = v.id OR w.alt_vehicle_id = v.id) and w.deleted_at is null
        ) and not EXISTS (
          SELECT 1 FROM "${data.schema}".absence_vehicle a 
      	  WHERE '${data.working_date}'::timestamp BETWEEN a.start_date AND a.end_date 
		      and a.absence_vehicle = v.id and a.deleted_at is null
        ) and ('${data.working_date}'::timestamp between v.operation_start_date and v.operation_end_date or
        (v.operation_start_date < '${data.working_date}'::timestamp and v.operation_end_date is null))
        and v.status != 'DISPOSED' and v.deleted_at is null group by v.purpose;`,
      ),
      this.dataSource.query(
        `SELECT count(*), v.purpose FROM "${data.schema}".vehicle v 
        WHERE EXISTS (
          SELECT 1 FROM "${data.schema}".dispatches w
          WHERE w.date = '${data.working_date}'::timestamp 
          and (w.vehicle_id = v.id OR w.alt_vehicle_id = v.id) and w.deleted_at is null
        ) and v.deleted_at is null group by v.purpose;`,
      ),
      this.dataSource.query(
        `SELECT count(*), v.purpose FROM "${data.schema}".absence_vehicle av
        left join "${data.schema}".vehicle v on av.absence_vehicle = v.id and v.deleted_at is null 
        where '${data.working_date}'::timestamp between av.start_date and av.end_date 
        and av.deleted_at is null group by v.purpose`,
      ),
      this.dataSource.query(
        `SELECT v.id, v.vehicle_number, av.id as aid, av.absence_type FROM "${data.schema}".absence_vehicle av
        left join "${data.schema}".vehicle v on av.absence_vehicle = v.id and v.deleted_at is null 
        where '${data.working_date}'::timestamp between av.start_date and av.end_date 
        and v.purpose = 'COMPOSITE_REGULAR' and av.deleted_at is null;`,
      ),
      this.dataSource.query(
        `SELECT v.id, v.vehicle_number, av.id as aid, av.absence_type FROM "${data.schema}".absence_vehicle av
        left join "${data.schema}".vehicle v on av.absence_vehicle = v.id and v.deleted_at is null 
        where '${data.working_date}'::timestamp between av.start_date and av.end_date 
        and v.purpose = 'COMPOSITE_SUPPORT' and av.deleted_at is null;`,
      ),
      this.dataSource.query(
        `SELECT v.id, v.vehicle_number, av.id as aid, av.absence_type FROM "${data.schema}".absence_vehicle av
        left join "${data.schema}".vehicle v on av.absence_vehicle = v.id and v.deleted_at is null 
        where '${data.working_date}'::timestamp between av.start_date and av.end_date 
        and v.purpose = 'FOOD_REGULAR' and av.deleted_at is null;`,
      ),
      this.dataSource.query(
        `SELECT v.id, v.vehicle_number, av.id as aid, av.absence_type FROM "${data.schema}".absence_vehicle av
        left join "${data.schema}".vehicle v on av.absence_vehicle = v.id and v.deleted_at is null 
        where '${data.working_date}'::timestamp between av.start_date and av.end_date 
        and v.purpose = 'FOOD_SUPPORT' and av.deleted_at is null;`,
      ),
      this.dataSource.query(
        `SELECT v.id, v.vehicle_number, av.id as aid, av.absence_type FROM "${data.schema}".absence_vehicle av
        left join "${data.schema}".vehicle v on av.absence_vehicle = v.id and v.deleted_at is null 
        where '${data.working_date}'::timestamp between av.start_date and av.end_date 
        and v.purpose = 'REUSABLE_REGULAR' and av.deleted_at is null;`,
      ),
      this.dataSource.query(
        `SELECT v.id, v.vehicle_number, av.id as aid, av.absence_type FROM "${data.schema}".absence_vehicle av
        left join "${data.schema}".vehicle v on av.absence_vehicle = v.id and v.deleted_at is null 
        where '${data.working_date}'::timestamp between av.start_date and av.end_date 
        and v.purpose = 'REUSABLE_SUPPORT' and av.deleted_at is null;`,
      ),
      this.dataSource.query(
        `SELECT v.id, v.vehicle_number, av.id as aid, av.absence_type FROM "${data.schema}".absence_vehicle av
        left join "${data.schema}".vehicle v on av.absence_vehicle = v.id and v.deleted_at is null 
        where '${data.working_date}'::timestamp between av.start_date and av.end_date 
        and v.purpose = 'TATICAL_MOBILITY_REGULAR' and av.deleted_at is null;`,
      ),
      this.dataSource.query(
        `SELECT v.id, v.vehicle_number, av.id as aid, av.absence_type FROM "${data.schema}".absence_vehicle av
        left join "${data.schema}".vehicle v on av.absence_vehicle = v.id and v.deleted_at is null 
        where '${data.working_date}'::timestamp between av.start_date and av.end_date 
        and v.purpose = 'TATICAL_MOBILITY_SUPPORT' and av.deleted_at is null;`,
      ),
      this.dataSource.query(
        `SELECT s.id, s.name, ab.absence_type, ab.repeat, ab.id as aid, ab.repeat_days_week, ab.repeat_days_month, 
        ab.start_date, ab.end_date FROM "${data.schema}".staff s left join "${data.schema}".absence_staff ab 
        on ab.absence_staff_id = s.id and ab.deleted_at is null 
        WHERE s.job_contract = 'DRIVING_CREW_REGULAR' and '${data.working_date}'::timestamp between ab.start_date 
        and ab.end_date and s.deleted_at is null`,
      ),
      this.dataSource.query(
        `SELECT s.id, s.name, ab.absence_type, ab.repeat, ab.id as aid, ab.repeat_days_week, ab.repeat_days_month, 
        ab.start_date, ab.end_date FROM "${data.schema}".staff s left join "${data.schema}".absence_staff ab 
        on ab.absence_staff_id = s.id and ab.deleted_at is null 
        WHERE '${data.working_date}'::timestamp between ab.start_date and ab.end_date 
        and s.job_contract = 'COLLECT_CREW_FIXED_TERM' and s.deleted_at is null`,
      ),
      this.dataSource.query(
        `SELECT s.id, s.name, ab.absence_type, ab.repeat, ab.id as aid, ab.repeat_days_week, ab.repeat_days_month, 
        ab.start_date, ab.end_date FROM "${data.schema}".staff s left join "${data.schema}".absence_staff ab 
        on ab.absence_staff_id = s.id and ab.deleted_at is null 
        WHERE '${data.working_date}'::timestamp between ab.start_date and ab.end_date 
        and s.job_contract = 'COLLECT_CREW_REGULAR' and s.deleted_at is null`,
      ),
      this.dataSource.query(
        `SELECT s.id, s.name, ab.absence_type, ab.repeat, ab.id as aid, ab.repeat_days_week, ab.repeat_days_month, 
        ab.start_date, ab.end_date FROM "${data.schema}".staff s left join "${data.schema}".absence_staff ab 
        on ab.absence_staff_id = s.id and ab.deleted_at is null 
        WHERE '${data.working_date}'::timestamp between ab.start_date and ab.end_date 
        and s.job_contract = 'COLLECT_CREW_MONTHLY' and s.deleted_at is null`,
      ),
      this.dataSource.query(
        `SELECT s.id, s.name, ab.absence_type, ab.repeat, ab.id as aid, ab.repeat_days_week, ab.repeat_days_month, 
        ab.start_date, ab.end_date FROM "${data.schema}".staff s left join "${data.schema}".absence_staff ab 
        on ab.absence_staff_id = s.id and ab.deleted_at is null 
        WHERE '${data.working_date}'::timestamp between ab.start_date and ab.end_date 
        and s.job_contract = 'SUPPORT_CREW_REGULAR' and s.deleted_at is null`,
      ),
      this.dataSource.query(
        `SELECT s.id, s.name, ab.absence_type, ab.repeat, ab.id as aid, ab.repeat_days_week, ab.repeat_days_month, 
        ab.start_date, ab.end_date FROM "${data.schema}".staff s left join "${data.schema}".absence_staff ab 
        on ab.absence_staff_id = s.id and ab.deleted_at is null 
        WHERE '${data.working_date}'::timestamp between ab.start_date and ab.end_date 
        and s.job_contract = 'SUPPORT_CREW_FIXED_TERM' and s.deleted_at is null`,
      ),
      this.dataSource.query(
        `SELECT s.id, s.name FROM "${data.schema}".staff s 
        WHERE NOT EXISTS (
          SELECT 1 FROM "${data.schema}".dispatches w
          WHERE w.date = '${data.working_date}'::timestamp and 
          (w.driver_id = s.id or w.alt_driver_id = s.id) and w.deleted_at is null
        ) and ('${data.working_date}'::timestamp between s.start_date and s.end_date or 
        (s.start_date < '${data.working_date}'::timestamp and s.end_date is null)) 
        and s.job_contract = 'DRIVING_CREW_REGULAR' and s.deleted_at is null`,
      ),
      this.dataSource.query(
        collectorAvailableStr +
          "'COLLECT_CREW_REGULAR'" +
          ' and s.deleted_at is null',
      ),
      this.dataSource.query(
        collectorAvailableStr +
          "'COLLECT_CREW_MONTHLY'" +
          ' and s.deleted_at is null',
      ),
      this.dataSource.query(
        collectorAvailableStr +
          "'COLLECT_CREW_FIXED_TERM'" +
          ' and s.deleted_at is null',
      ),
      this.dataSource.query(
        collectorAvailableStr +
          "'SUPPORT_CREW_REGULAR'" +
          ' and s.deleted_at is null',
      ),
      this.dataSource.query(
        collectorAvailableStr +
          "'SUPPORT_CREW_FIXED_TERM'" +
          ' and s.deleted_at is null',
      ),
      this.dataSource.query(
        `SELECT v.id, v.vehicle_number, v.purpose, av.absence_type, av.id as aid FROM "${data.schema}".vehicle v 
        left join "${data.schema}".absence_vehicle av on (av.replacement_vehicle = v.id and 
        '${data.working_date}'::timestamp between av.start_date::timestamp and av.end_date::timestamp and av.deleted_at is null) 
        WHERE not EXISTS (
          SELECT 1 FROM "${data.schema}".dispatches w
          WHERE w.date = '${data.working_date}'::timestamp 
          and (w.vehicle_id = v.id OR w.alt_vehicle_id = v.id) and w.deleted_at is null
        ) and not EXISTS (
          SELECT 1 FROM "${data.schema}".absence_vehicle a 
      	  WHERE '${data.working_date}'::timestamp BETWEEN a.start_date AND a.end_date 
		      and a.absence_vehicle = v.id and a.deleted_at is null
        )
        and ('${data.working_date}'::timestamp between v.operation_start_date and v.operation_end_date or
        (v.operation_start_date < '${data.working_date}'::timestamp and v.operation_end_date is null)) 
        and v.status != 'DISPOSED' and v.deleted_at is null;`,
      ),
    ]);
    const staffAbsence = {
      DRIVING_CREW_REGULAR: this.filterAbsenceStaff(
        driverAbsence,
        data.working_date,
      ),
      COLLECT_CREW_REGULAR: this.filterAbsenceStaff(
        collectRegularAbsence,
        data.working_date,
      ),
      COLLECT_CREW_MONTHLY: this.filterAbsenceStaff(
        collectMonthAbsence,
        data.working_date,
      ),
      COLLECT_CREW_FIXED_TERM: this.filterAbsenceStaff(
        collectFixAbsence,
        data.working_date,
      ),
      SUPPORT_CREW_REGULAR: this.filterAbsenceStaff(
        supportRegularAbsence,
        data.working_date,
      ),
      SUPPORT_CREW_FIXED_TERM: this.filterAbsenceStaff(
        supportFixAbsence,
        data.working_date,
      ),
    };
    const staffAvailable = {
      DRIVING_CREW_REGULAR: await this.filterAvailableStaff(
        data.working_date,
        driverAvailable,
        data.schema,
      ),
      COLLECT_CREW_REGULAR: await this.filterAvailableStaff(
        data.working_date,
        collectRegularAvailable,
        data.schema,
      ),
      COLLECT_CREW_MONTHLY: await this.filterAvailableStaff(
        data.working_date,
        collectMonthAvailable,
        data.schema,
      ),
      COLLECT_CREW_FIXED_TERM: await this.filterAvailableStaff(
        data.working_date,
        collectFixAvailable,
        data.schema,
      ),
      SUPPORT_CREW_REGULAR: await this.filterAvailableStaff(
        data.working_date,
        supportRegularAvailable,
        data.schema,
      ),
      SUPPORT_CREW_FIXED_TERM: await this.filterAvailableStaff(
        data.working_date,
        supportFixAvailable,
        data.schema,
      ),
    };
    const vehicleAvailableFilter = {
      COMPOSITE_REGULAR: vehicleAvailable.filter(
        (v) => v.purpose === 'COMPOSITE_REGULAR',
      ),
      COMPOSITE_SUPPORT: vehicleAvailable.filter(
        (v) => v.purpose === 'COMPOSITE_SUPPORT',
      ),
      FOOD_REGULAR: vehicleAvailable.filter(
        (v) => v.purpose === 'FOOD_REGULAR',
      ),
      FOOD_SUPPORT: vehicleAvailable.filter(
        (v) => v.purpose === 'FOOD_SUPPORT',
      ),
      REUSABLE_REGULAR: vehicleAvailable.filter(
        (v) => v.purpose === 'REUSABLE_REGULAR',
      ),
      REUSABLE_SUPPORT: vehicleAvailable.filter(
        (v) => v.purpose === 'REUSABLE_SUPPORT',
      ),
      TATICAL_MOBILITY_REGULAR: vehicleAvailable.filter(
        (v) => v.purpose === 'TATICAL_MOBILITY_REGULAR',
      ),
      TATICAL_MOBILITY_SUPPORT: vehicleAvailable.filter(
        (v) => v.purpose === 'TATICAL_MOBILITY_SUPPORT',
      ),
    };
    const staffCount = {
      DRIVING_CREW_REGULAR: [
        +staffActiveCount.find((s) => s.job_contract === 'DRIVING_CREW_REGULAR')
          ?.count || 0,
        staffAvailable.DRIVING_CREW_REGULAR.length,
        staffAbsence.DRIVING_CREW_REGULAR.length,
      ],
      COLLECT_CREW_MONTHLY: [
        +staffActiveCount.find((s) => s.job_contract === 'COLLECT_CREW_MONTHLY')
          ?.count || 0,
        staffAvailable.COLLECT_CREW_MONTHLY.length,
        staffAbsence.COLLECT_CREW_MONTHLY.length,
      ],
      COLLECT_CREW_REGULAR: [
        +staffActiveCount.find((s) => s.job_contract === 'COLLECT_CREW_REGULAR')
          ?.count || 0,
        staffAvailable.COLLECT_CREW_REGULAR.length,
        staffAbsence.COLLECT_CREW_REGULAR.length,
      ],
      COLLECT_CREW_FIXED_TERM: [
        +staffActiveCount.find(
          (s) => s.job_contract === 'COLLECT_CREW_FIXED_TERM',
        )?.count || 0,
        staffAvailable.COLLECT_CREW_FIXED_TERM.length,
        staffAbsence.COLLECT_CREW_FIXED_TERM.length,
      ],
      SUPPORT_CREW_REGULAR: [
        +staffActiveCount.find((s) => s.job_contract === 'SUPPORT_CREW_REGULAR')
          ?.count || 0,
        staffAvailable.SUPPORT_CREW_REGULAR.length,
        staffAbsence.SUPPORT_CREW_REGULAR.length,
      ],
      SUPPORT_CREW_FIXED_TERM: [
        +staffActiveCount.find(
          (s) => s.job_contract === 'SUPPORT_CREW_FIXED_TERM',
        )?.count || 0,
        staffAvailable.SUPPORT_CREW_FIXED_TERM.length,
        staffAbsence.SUPPORT_CREW_FIXED_TERM.length,
      ],
    };
    const vehicleCount = {
      COMPOSITE_REGULAR: [
        +vehicleActiveCount.find((v) => v.purpose === 'COMPOSITE_REGULAR')
          ?.count || 0,
        +vehicleAvailableCount.find((v) => v.purpose === 'COMPOSITE_REGULAR')
          ?.count || 0,
        +vehicleAbsenceCount.find((v) => v.purpose === 'COMPOSITE_REGULAR')
          ?.count || 0,
      ],
      COMPOSITE_SUPPORT: [
        +vehicleActiveCount.find((v) => v.purpose === 'COMPOSITE_SUPPORT')
          ?.count || 0,
        +vehicleAvailableCount.find((v) => v.purpose === 'COMPOSITE_SUPPORT')
          ?.count || 0,
        +vehicleAbsenceCount.find((v) => v.purpose === 'COMPOSITE_SUPPORT')
          ?.count || 0,
      ],
      FOOD_REGULAR: [
        +vehicleActiveCount.find((v) => v.purpose === 'FOOD_REGULAR')?.count ||
          0,
        +vehicleAvailableCount.find((v) => v.purpose === 'FOOD_REGULAR')
          ?.count || 0,
        +vehicleAbsenceCount.find((v) => v.purpose === 'FOOD_REGULAR')?.count ||
          0,
      ],
      FOOD_SUPPORT: [
        +vehicleActiveCount.find((v) => v.purpose === 'FOOD_SUPPORT')?.count ||
          0,
        +vehicleAvailableCount.find((v) => v.purpose === 'FOOD_SUPPORT')
          ?.count || 0,
        +vehicleAbsenceCount.find((v) => v.purpose === 'FOOD_SUPPORT')?.count ||
          0,
      ],
      REUSABLE_REGULAR: [
        +vehicleActiveCount.find((v) => v.purpose === 'REUSABLE_REGULAR')
          ?.count || 0,
        +vehicleAvailableCount.find((v) => v.purpose === 'REUSABLE_REGULAR')
          ?.count || 0,
        +vehicleAbsenceCount.find((v) => v.purpose === 'REUSABLE_REGULAR')
          ?.count || 0,
      ],
      REUSABLE_SUPPORT: [
        +vehicleActiveCount.find((v) => v.purpose === 'REUSABLE_SUPPORT')
          ?.count || 0,
        +vehicleAvailableCount.find((v) => v.purpose === 'REUSABLE_SUPPORT')
          ?.count || 0,
        +vehicleAbsenceCount.find((v) => v.purpose === 'REUSABLE_SUPPORT')
          ?.count || 0,
      ],
      TATICAL_MOBILITY_REGULAR: [
        +vehicleActiveCount.find(
          (v) => v.purpose === 'TATICAL_MOBILITY_REGULAR',
        )?.count || 0,
        +vehicleAvailableCount.find(
          (v) => v.purpose === 'TATICAL_MOBILITY_REGULAR',
        )?.count || 0,
        +vehicleAbsenceCount.find(
          (v) => v.purpose === 'TATICAL_MOBILITY_REGULAR',
        )?.count || 0,
      ],
      TATICAL_MOBILITY_SUPPORT: [
        +vehicleActiveCount.find(
          (v) => v.purpose === 'TATICAL_MOBILITY_SUPPORT',
        )?.count || 0,
        +vehicleAvailableCount.find(
          (v) => v.purpose === 'TATICAL_MOBILITY_SUPPORT',
        )?.count || 0,
        +vehicleAbsenceCount.find(
          (v) => v.purpose === 'TATICAL_MOBILITY_SUPPORT',
        )?.count || 0,
      ],
    };
    const collectBackupCount = +agent1BackupCount + +agent2BackupCount;
    return {
      statistics: {
        routeCount: total,
        vehicleRegularCount: total - vehicleBackupCount,
        vehicleBackupCount,
        driverRegularCount: total - driverBackupCount,
        driverBackupCount,
        collectRegularCount: total * 2 - collectBackupCount,
        collectBackupCount,
        sumNonCollectDistance: +sumNonCollectDistance[0]?.sum || 0,
        sumCollectDistance: +sumSectionDistance[0]?.sum || 0,
        replacementRate: (driverBackupCount + collectBackupCount) / (total * 3),
      },
      staffSection: {
        driverActive: total + driverBackupCount,
        driverBackupCount,
        agent1BackupCount,
        agent2BackupCount,
        staffCount,
        staffAbsence,
        staffAvailable,
      },
      vehicleSection: {
        vehicleCount,
        vehicleAbsence: {
          COMPOSITE_REGULAR: vehicleAbsenceCompositeR,
          COMPOSITE_SUPPORT: vehicleAbsenceCompositeS,
          FOOD_REGULAR: vehicleAbsenceFoodR,
          FOOD_SUPPORT: vehicleAbsenceFoodS,
          REUSABLE_REGULAR: vehicleAbsenceReusableR,
          REUSABLE_SUPPORT: vehicleAbsenceReusableS,
          TATICAL_MOBILITY_REGULAR: vehicleAbsenceTaticR,
          TATICAL_MOBILITY_SUPPORT: vehicleAbsenceTaticS,
        },
        vehicleAvailable: vehicleAvailableFilter,
      },
    };
  }

  checkRepeat(staffOffs: AbsenceStaffEntity[], working_date: Date) {
    const absenceRepeat = [];
    for (const sOff of staffOffs) {
      if (sOff.repeat === REPEAT.WEEKLY) {
        const startWeek = moment(sOff.start_date).startOf('week');
        const endWeek = moment(sOff.end_date).startOf('week');
        const weeks = endWeek.diff(startWeek, 'week', true);
        for (let i = 0; i <= weeks; i++) {
          let check = false;
          for (const day of sOff.repeat_days_week.split(',')) {
            const indexDay = [
              'MONDAY',
              'TUESDAY',
              'WEDNESDAY',
              'THURSDAY',
              'FRIDAY',
              'SATURDAY',
            ].findIndex((i) => i === day);
            const dateOfDay = moment(sOff.start_date)
              .startOf('week')
              .add(i, 'week')
              .day(indexDay + 1)
              .format('YYYY-MM-DD 00:00:00');
            if (
              dateOfDay === moment(working_date).format('YYYY-MM-DD 00:00:00')
            ) {
              absenceRepeat.push(sOff);
              check = true;
            }
          }
          if (check) break;
        }
      } else if (sOff.repeat === REPEAT.MONTHLY) {
        const startMonth = moment(sOff.start_date).startOf('month');
        const endMonth = moment(sOff.end_date).startOf('month');
        const months = endMonth.diff(startMonth, 'month', true);
        for (let i = 0; i <= months; i++) {
          let check = false;
          for (const day of sOff.repeat_days_month.split(',')) {
            const dateOfDay = moment(startMonth)
              .add(i, 'month')
              .add(+day - 1, 'day')
              .format('YYYY-MM-DD 00:00:00');
            if (
              dateOfDay === moment(working_date).format('YYYY-MM-DD 00:00:00')
            ) {
              absenceRepeat.push(sOff);
              check = true;
            }
          }
          if (check) break;
        }
      }
    }
    return absenceRepeat;
  }

  async filterAvailableStaff(
    working_date: Date,
    availables: any[],
    schema: string,
  ) {
    if (!availables.length) {
      return [];
    }
    const staffArrStr = availables.map((c) => c.id).join(',');
    const staffOffs = await this.absenceStaffEntity
      .createQueryBuilder('a')
      .where(
        `'${working_date}'::timestamp BETWEEN a.start_date AND a.end_date 
        and (a.absence_staff_id in (${staffArrStr}))
        and a.repeat in ('WEEKLY', 'MONTHLY')`,
      )
      .getMany();
    const absenceRepeat = this.checkRepeat(staffOffs, working_date);
    const staffAvailableFilter = availables
      .filter((c) => !absenceRepeat.find((a) => a.absence_staff_id === c.id))
      .map((s) => `'${s.id}'`);
    if (!staffAvailableFilter.length) {
      return [];
    }
    const checkReplacer = await this.dataSource.query(
      `SELECT s.id, s.name, ab.replacer_staff_id, ab.absence_type, ab.start_date, ab.end_date, ab.repeat,
      ab.repeat_days_week, ab.repeat_days_month  
      FROM "${schema}".staff s left join "${schema}".absence_staff ab 
      on ab.replacer_staff_id = s.id where s.id in (${staffAvailableFilter}) 
      group by s.id, ab.replacer_staff_id, ab.absence_type, ab.start_date, ab.end_date, ab.id`,
    );
    const res = [];
    for (const s of checkReplacer) {
      if (s.absence_type) {
        if (
          !moment(working_date).isBetween(
            moment(s.start_date).subtract(1),
            moment(s.end_date).add(1),
          )
        ) {
          s.absence_type = null;
          s.replacer_staff_id = null;
          delete s.start_date;
          delete s.end_date;
        } else {
          if (s.repeat === 'MONTHLY' || s.repeat === 'WEEKLY') {
            const check = this.checkRepeat([s], working_date);
            if (!check.length) {
              s.absence_type = null;
              s.replacer_staff_id = null;
              delete s.start_date;
              delete s.end_date;
              delete s.repeat_days_week;
              delete s.repeat_days_month;
              delete s.repeat;
            }
          }
        }
      }
      const exists = res.find((r) => r.id === s.id);
      if (exists) {
        if (!exists.absence_type) {
          const ind = res.findIndex((r) => r.id === s.id);
          res[ind].absence_type = s.absence_type;
          res[ind].replacer_staff_id = s.replacer_staff_id;
          res[ind].start_date = s.start_date;
          res[ind].end_date = s.end_date;
        }
        continue;
      }
      res.push(s);
    }
    return res;
  }

  filterAbsenceStaff(staffs: any[], working_date: Date) {
    const staffArr = [...new Set(staffs.map((c) => c.id))];
    // const staffArrStr = staffArr.join(',');
    if (!staffArr.length) {
      return [];
    }
    const normals = staffs.filter((s) => s.repeat === 'NONE');
    const repeats = staffs.filter(
      (s) => s.repeat !== 'NONE' && !normals.find((n) => n.id === s.id),
    );
    const absenceRepeat = this.checkRepeat(repeats, working_date);
    // const staffAbsenceFilter = repeats.filter(
    //   (c) => !absenceRepeat.find((a) => a.absence_staff_id === c.id),
    // );

    return [...normals, ...absenceRepeat];
  }
}
