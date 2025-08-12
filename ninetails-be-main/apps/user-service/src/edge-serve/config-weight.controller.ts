import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ConfigWeightEntity } from 'libs/entities/config-weight.entity';
import { responseHelper } from 'libs/utils/helper.util';
import { Repository } from 'typeorm';
import { ConfigWeightForm } from './config-weight.dto';
import { EdgeServeEntity } from 'libs/entities/edge-serve.entity';

@ApiTags('Edge Serve')
@ApiBearerAuth()
@Controller('config-weight')
export class ConfigWeightController {
  constructor(
    @Inject('CONFIG_WEIGHT_REPO')
    private configWeightEntity: Repository<ConfigWeightEntity>,
    @Inject('EDGE_SERVE_REPO')
    private edgeServeEntity: Repository<EdgeServeEntity>,
  ) {}

  @Get()
  @ApiOkResponse({})
  async list() {
    const check = await this.configWeightEntity
      .createQueryBuilder()
      .getExists();
    if (!check) {
      const entity = this.configWeightEntity.create();
      entity['5L_gen'] = 3.14;
      entity['10L_gen'] = 5.22;
      entity['10L_reu'] = 5.73;
      entity['20L_gen'] = 11.54;
      entity['20L_reu'] = 12.32;
      entity['30L_gen'] = 15.45;
      entity['50L_gen'] = 30.41;
      entity['50L_pub'] = 26.98;
      entity['75L_gen'] = 30.04;
      entity['75L_pub'] = 32.74;
      entity['ext'] = 27.32;
      entity['etc'] = 18.41;

      await this.configWeightEntity.save(entity);
    }

    const data = await this.configWeightEntity.createQueryBuilder().getOne();

    return responseHelper({
      data: data,
    });
  }

  @Post()
  @ApiOkResponse({})
  async save(@Body() input: ConfigWeightForm) {
    let data = await this.configWeightEntity.createQueryBuilder().getOne();
    if (data) {
      await this.configWeightEntity.update(data.id, input);
      data = await this.configWeightEntity.createQueryBuilder().getOne();
    } else {
      const entity = this.configWeightEntity.create(input);
      data = await this.configWeightEntity.save(entity);
    }

    await this.edgeServeEntity
      .createQueryBuilder()
      .update()
      .set({ edge_setting_version: () => 'edge_setting_version + 0.01' })
      .execute();

    return responseHelper({
      data: data,
    });
  }
}
