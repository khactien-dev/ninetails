import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { EdgeServeEntity } from 'libs/entities/edge-serve.entity';
import {
  EdgeServeCreateForm,
  EdgeServeUpdateForm,
  EdgeServeUpdateManyInput,
} from './edge-serve.dto';
import { BaseQueryReq } from 'libs/dtos/base.req';
import { ESORT_EDGESERVER } from 'libs/enums/common.enum';

@Injectable()
export class EdgeServeService {
  constructor(
    @Inject('EDGE_SERVE_REPO')
    private edgeServeEntity: Repository<EdgeServeEntity>,
  ) {}

  async list(query: BaseQueryReq) {
    if (query.sortField == 'status') {
      query.sortBy = (query.sortBy === 'ASC' ? 'DESC' : 'ASC') as any;
    }

    const [items, total] = await this.edgeServeEntity
      .createQueryBuilder('edge')
      .leftJoinAndSelect('edge.vehicle', 'vehicle')
      .take(query.pageSize)
      .skip((query.page - 1) * query.pageSize)
      .orderBy(
        query.sortField === ESORT_EDGESERVER.VEHICLENUMBER
          ? 'vehicle.vehicle_number'
          : `edge.${query.sortField}`,
        query.sortBy as any,
      )
      .getManyAndCount();

    return { items: items, total };
  }

  async create(input: EdgeServeCreateForm) {
    const checkMacAddress = await this.edgeServeEntity
      .createQueryBuilder()
      .where({
        mac_address: input.mac_address,
      })
      .getExists();
    if (checkMacAddress) {
      throw new BadRequestException(
        // 'This MAC address has been used. Please enter another one!',
        '이 MAC 주소는 이미 사용 중입니다. 다른 주소를 입력해 주세요!',
      );
    }

    const checkVehicle = await this.edgeServeEntity
      .createQueryBuilder()
      .where({ vehicle: { id: input.vehicle.id } })
      .getExists();

    if (checkVehicle) {
      throw new BadRequestException(
        // 'This vehicle has been selected. Please select a different one!',
        '이 차량이 선택되었습니다. 다른 차량을 선택해 주세요!',
      );
    }

    const checkName = await this.edgeServeEntity
      .createQueryBuilder()
      .where({
        edge_name: input.edge_name,
      })
      .getExists();

    if (checkName) {
      throw new BadRequestException(
        // 'This updater already exists. Please enter a different name.',
        '이 업데이트 담당자는 이미 존재합니다. 다른 이름을 입력해 주세요.',
      );
    }

    if (!input.password) {
      input.password = Math.random().toString(36).slice(-8);
    }
    const entity = this.edgeServeEntity.create(input);
    try {
      let edgeServe = await this.edgeServeEntity.save(entity);
      edgeServe = await this.edgeServeEntity.findOne({
        where: { id: edgeServe.id },
        relations: ['vehicle'],
      });
      await this.updateVersion(edgeServe);

      return edgeServe;
    } catch (error) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }
  }

  async update(id: number, input: EdgeServeUpdateForm) {
    let edgeServe = await this.edgeServeEntity.findOneBy({ id: id });

    if (input.mac_address) {
      const checkMacAddress = await this.edgeServeEntity
        .createQueryBuilder()
        .where({
          mac_address: input.mac_address,
          id: Not(edgeServe.id),
        })
        .getExists();
      if (checkMacAddress) {
        throw new BadRequestException(
          // 'This MAC address has been used. Please enter another one!',
          '이 MAC 주소는 이미 사용 중입니다. 다른 주소를 입력해 주세요!',
        );
      }
    }
    if (input.vehicle) {
      const checkVehicle = await this.edgeServeEntity
        .createQueryBuilder()
        .where({
          vehicle: { id: input.vehicle.id },
          id: Not(edgeServe.id),
        })
        .getExists();

      if (checkVehicle) {
        throw new BadRequestException(
          // 'This vehicle has been selected. Please select a different one!',
          '이 차량이 선택되었습니다. 다른 차량을 선택해 주세요!',
        );
      }
    }

    if (input.edge_name) {
      const checkName = await this.edgeServeEntity
        .createQueryBuilder()
        .where({
          edge_name: input.edge_name,
          id: Not(edgeServe.id),
        })
        .getExists();

      if (checkName) {
        throw new BadRequestException(
          // 'This updater already exists. Please enter a different name.',
          '이 업데이트 담당자는 이미 존재합니다. 다른 이름을 입력해 주세요.',
        );
      }
    }

    try {
      await this.edgeServeEntity.update(id, input);
      edgeServe = await this.edgeServeEntity.findOne({
        where: { id: id },
        relations: ['vehicle'],
      });
      await this.updateVersion(edgeServe);

      return edgeServe;
    } catch (error) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }
  }

  async detail(id: number) {
    const edgeServe = await this.edgeServeEntity.findOne({
      where: { id: id },
      relations: ['vehicle'],
    });
    return edgeServe;
  }

  async delete(id: number) {
    const data = await this.edgeServeEntity.delete(id);

    if (!data.affected) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }

    return true;
  }

  async updateMany(ids, input: EdgeServeUpdateManyInput) {
    await this.edgeServeEntity
      .createQueryBuilder()
      .update()
      .set({
        edge_setting_version: () => 'edge_setting_version + 0.01', // update version
        status: input.status,
      })
      .whereInIds(ids)
      .execute();

    const data = await this.edgeServeEntity
      .createQueryBuilder('edge')
      .leftJoinAndSelect('edge.vehicle', 'vehicle')
      .whereInIds(ids)
      .getMany();

    return data;
  }

  async deleteMany(ids) {
    const data = await this.edgeServeEntity
      .createQueryBuilder()
      .where('id IN(:...ids)', { ids })
      .delete()
      .execute();

    if (!data.affected) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }

    return data.affected;
  }

  async updateVersion(edgeServe: EdgeServeEntity) {
    const items = await this.edgeServeEntity
      .createQueryBuilder()
      .where('id != :id', { id: edgeServe.id })
      .getMany();
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      let hasUpdate = false;
      // edge_metrics_checkbox
      if (edgeServe.edge_metrics_checkbox && item.edge_metrics_checkbox) {
        item.edge_metrics = edgeServe.edge_metrics;
        hasUpdate = true;
      }
      // collection_metrics_checkbox
      if (
        edgeServe.collection_metrics_checkbox &&
        item.collection_metrics_checkbox
      ) {
        item.collection_metrics = edgeServe.collection_metrics;
        hasUpdate = true;
      }
      // operation_metrics_checkbox
      if (
        edgeServe.operation_metrics_checkbox &&
        item.operation_metrics_checkbox
      ) {
        item.operation_metrics = edgeServe.operation_metrics;
        hasUpdate = true;
      }
      // operation_status_ui_checkbox
      if (
        edgeServe.operation_status_ui_checkbox &&
        item.operation_status_ui_checkbox
      ) {
        item.operation_status_ui = edgeServe.operation_status_ui;
        hasUpdate = true;
      }
      // collection_status_ui_checkbox
      if (
        edgeServe.collection_status_ui_checkbox &&
        item.collection_status_ui_checkbox
      ) {
        item.collection_status_ui = edgeServe.collection_status_ui;
        hasUpdate = true;
      }
      // volume_analysis_ui_checkbox
      if (
        edgeServe.volume_analysis_ui_checkbox &&
        item.volume_analysis_ui_checkbox
      ) {
        item.volume_analysis_ui = edgeServe.volume_analysis_ui;
        hasUpdate = true;
      }
      // quantity_analysis_ui_checkbox
      if (
        edgeServe.quantity_analysis_ui_checkbox &&
        item.quantity_analysis_ui_checkbox
      ) {
        item.quantity_analysis_ui = edgeServe.quantity_analysis_ui;
        hasUpdate = true;
      }
      // video_ui_checkbox
      if (edgeServe.video_ui_checkbox && item.video_ui_checkbox) {
        item.video_ui = edgeServe.video_ui;
        hasUpdate = true;
      }
      if (hasUpdate) {
        item.edge_setting_version = item.edge_setting_version * 1 + 0.01;
        this.edgeServeEntity.save(item);
      }
    }
  }
}
