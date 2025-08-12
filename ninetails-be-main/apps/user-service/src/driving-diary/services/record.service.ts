import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Equal, Repository } from 'typeorm';
import { DrivingRecordEntity } from 'libs/entities/driving-record.entity';
import { DrivingRecordSaveDto } from '../dtos/driving-record.dto';
import * as moment from 'moment';
import { LandfillCreateDto } from '../dtos/landfill.dto';
import { LandfillRecordEntity } from 'libs/entities/landfill-record.entity';
import { IPaginate } from 'libs/common/common.interface';

@Injectable()
export class RecordService {
  constructor(
    @Inject('DRIVING_RECORD_REPO')
    private drivingRepository: Repository<DrivingRecordEntity>,
    @Inject('LANDFILL_RECORD_REPO')
    private landfillRepository: Repository<LandfillRecordEntity>,
  ) {}

  async saveDriving(data: DrivingRecordSaveDto) {
    const {
      distance_today,
      distance_yesterday,
      fuel_volumn,
      fuel_today,
      fuel_yesterday,
      vehicle_id,
    } = data;
    if (distance_today < distance_yesterday) {
      throw new BadRequestException('Invalid distance. Please input again!');
    }
    if (fuel_today > fuel_yesterday + (fuel_volumn || 0)) {
      throw new BadRequestException('Invalid fuel level. Please input again!');
    }
    const current = moment()
      .startOf('day')
      .format('YYYY-MM-DD 00:00:00') as any;
    let result = {};
    const record = await this.drivingRepository.findOne({
      where: {
        date: Equal(current),
        vehicle_id,
      },
    });
    if (record) {
      await this.drivingRepository.update({ id: record.id }, data);
      delete data.vehicle_id;
      result = await this.drivingRepository.findOne({
        where: { id: record.id },
      });
    } else {
      data.date = current;
      result = await this.drivingRepository.save(
        this.drivingRepository.create(data),
      );
    }
    return result;
  }

  async findOneDrivingRecord(vehicle_id: number, date: Date) {
    const handleDate = moment(date)
      .startOf('day')
      .format('YYYY-MM-DD 00:00:00');
    const record = await this.drivingRepository.findOne({
      where: {
        date: Equal(handleDate as any),
        vehicle_id,
      },
    });
    if (!record) {
      return null;
    }
    return record;
  }

  async createLandfill(data: LandfillCreateDto) {
    data.date = moment(data.date).format('YYYY-MM-DD 00:00:00') as any;
    return await this.landfillRepository.save(
      this.landfillRepository.create(data),
    );
  }

  async findAndCountLandfill(date: Date, paginate: IPaginate) {
    return await this.landfillRepository.find({
      ...paginate,
      where: { date: moment(date).format('YYYY-MM-DD 00:00:00') as any },
    });
  }

  async findOneLandfill(id: number) {
    const landfill = await this.landfillRepository.findOne({
      where: { id },
    });
    if (!landfill) {
      throw new BadRequestException('Landfill Not found');
    }
    return landfill;
  }

  async updateLandfill(id: number, data: LandfillCreateDto) {
    const landfill = await this.findOneLandfill(id);
    if (data.date && data.date !== landfill.date) {
      data.date = moment(data.date).format('YYYY-MM-DD 00:00:00') as any;
    }
    await this.landfillRepository.update({ id }, data);
    return await this.findOneLandfill(id);
  }
}
