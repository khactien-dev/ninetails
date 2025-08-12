import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactRequestEntity } from 'libs/entities/contact-request.entity';
import { DataSource, Repository } from 'typeorm';
import { ContactRequestForm } from './contact-request.dto';

@Injectable()
export class ContactRequestService {
  constructor(
    @InjectRepository(ContactRequestEntity)
    private contactRequestEntity: Repository<ContactRequestEntity>,
    private dataSource: DataSource,
  ) {}

  async create(input: ContactRequestForm) {
    input.email = input.email.toLowerCase();
    const entity = this.contactRequestEntity.create(input);
    try {
      return await this.contactRequestEntity.save(entity);
    } catch (error) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }
  }
}
