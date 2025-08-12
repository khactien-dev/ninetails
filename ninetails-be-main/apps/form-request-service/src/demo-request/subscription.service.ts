import { BadRequestException, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionEntity } from 'libs/entities/subcription.entity';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private subcriptionRepository: Repository<SubscriptionEntity>,
  ) {}

  async save(email: string) {
    try {
      email = email.toLowerCase();
      const data = await this.subcriptionRepository.findOneBy({ email: email });
      if (data) return;
      await this.subcriptionRepository.save({ email: email });
      return true;
    } catch (error) {
      throw new RpcException(
        new BadRequestException('Something went wrong. Please try again!'),
      );
    }
  }
}
