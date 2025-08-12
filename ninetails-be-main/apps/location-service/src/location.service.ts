import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateLocationReq,
  DeleteLocationReq,
  UpdateLocationReq,
} from './location.dto';
import { LocationEntity } from '../../../libs/entities/location.entity';
import { BaseQueryReq } from '../../../libs/dtos/base.req';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationEntity: Repository<any>,
  ) {}

  async get(query: BaseQueryReq) {
    const [items, total] = await this.locationEntity
      .createQueryBuilder()
      .take(query.pageSize)
      .skip((query.page - 1) * query.pageSize)
      .orderBy(
        `${query.sortField ?? 'id'}`,
        query.sortBy.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      )
      .getManyAndCount();

    return { items, total };
  }

  async detail(id: number) {
    return await this.findOne(id);
  }

  async create(data: CreateLocationReq) {
    const location = this.locationEntity.create(data);
    return this.locationEntity.save(location);
  }

  async findOne(id: number) {
    const location = await this.locationEntity.findOneBy({ id });
    if (!location) {
      throw new NotFoundException('Location Not Found');
    }
    return location;
  }

  async update(id: number, data: UpdateLocationReq) {
    await this.findOne(id);
    await this.locationEntity.update({ id }, data);
    return await this.findOne(id);
  }

  async delete(body: DeleteLocationReq) {
    for (const id of body.id) {
      await this.findOne(id);
      await this.locationEntity.softDelete(id);
    }
    return { message: 'Deletion process completed.' };
  }
}
