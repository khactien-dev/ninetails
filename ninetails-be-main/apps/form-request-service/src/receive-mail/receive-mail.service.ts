import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReceiveMailEntity } from 'libs/entities/receive-mail.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { ReceiveMailCreateDto, ReceiveMailReq } from './receive-mail.dto';
import { BaseQueryReq } from 'libs/dtos/base.req';

@Injectable()
export class ReceiveMailService {
  constructor(
    @InjectRepository(ReceiveMailEntity)
    private receiveMailEntity: Repository<ReceiveMailEntity>,
  ) {}

  async create(data: ReceiveMailCreateDto) {
    const check = await this.receiveMailEntity.findOne({
      where: { email: data.email },
    });
    if (check) {
      throw new BadRequestException('Your email has been registered.');
    }
    return await this.receiveMailEntity.save(
      this.receiveMailEntity.create(data),
    );
  }

  async findAndCount(query: ReceiveMailReq, pagination: BaseQueryReq) {
    const where: FindOptionsWhere<ReceiveMailEntity> = {};
    if (query.email) where.email = Like(`%${query.email}%`);
    return await this.receiveMailEntity.findAndCount({
      where,
      ...pagination,
    });
  }
}
