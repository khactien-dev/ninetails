import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DemoRequestEntity } from 'libs/entities/demo-request.entity';
import { Repository } from 'typeorm';
import { DemoRequestForm } from './demo-request.dto';

@Injectable()
export class DemoRequestService {
  constructor(
    @InjectRepository(DemoRequestEntity)
    private demoRequestEntity: Repository<DemoRequestEntity>,
  ) {}

  async create(input: DemoRequestForm) {
    input.email = input.email.toLowerCase();
    const entity = this.demoRequestEntity.create(input);
    try {
      return await this.demoRequestEntity.save(entity);
    } catch (error) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }
  }
}
