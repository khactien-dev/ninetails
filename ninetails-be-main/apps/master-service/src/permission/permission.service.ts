import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from 'libs/entities/tenant.entity';
import {CreatePermissionReq} from "../dto/permission.dto";
import {PermissionEntity} from "libs/entities/permission.entity";
import {UserMasterEntity} from "libs/entities/user-master.entity";
import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsIn, IsNotEmpty, IsNumber, IsString} from "class-validator";
import {CRUD, FULL, PERMISSION, RCUX, RU, RUX, RX} from "libs/enums/common.enum";

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionEntity)
    private permissionEntity: Repository<PermissionEntity>,
    @InjectRepository(TenantEntity)
    private tenantEntity: Repository<TenantEntity>,
    @InjectRepository(UserMasterEntity)
    private userMasterEntity: Repository<UserMasterEntity>,
  ) {}

  async create(data: CreatePermissionReq) {
    let permissions = await this.findByName(data.tenant_id, data.name);
    if (permissions.length > 0) {
      throw new BadRequestException(
        // 'This role already exists. Please enter a different name.'
        '해당 역할은 이미 존재합니다. 다른 이름을 입력해 주세요.',
      );
    }

    let newData = await this.handleData(data);
    console.log(newData);
    return await this.permissionEntity.save(newData);
  }

  async update(id, data: CreatePermissionReq) {
    let permission = await this.permissionEntity.findBy({id: id});
    if (permission.length < 1) {
      throw new NotFoundException('Error not found permission');
    }

    let permissionByName = await this.findByName(data.tenant_id, data.name);
    if (permissionByName.length > 0) {
      if (permissionByName[0].id != id) {
        throw new BadRequestException('This role already exists. Please enter a different name.');
      }
    }

    let newData = await this.handleData(data);
    return await this.permissionEntity.update(id, newData);
  }

  async getByTenant(tenantId) {
    return await this.permissionEntity.findBy({tenant_id: tenantId});
  }

  async delete(id) {
    let users = await this.userMasterEntity.findBy({permission_id: id});
    if (users.length > 0) {
      throw new BadRequestException(
        // 'Unable to delete this role. Please choose another one!',
        '해당 역할을 삭제할 수 없습니다. 다른 역할을 선택해 주세요!',
      );
    }
    return await this.permissionEntity.delete({id: id});
  }

  async findByName(tenantId, name) {
    return await this.permissionEntity.findBy({
      tenant_id: tenantId,
      name: name,
    })
  }

  async handleData(data) {
    return {
      tenant_id : data.tenant_id,
      name : data.name,
      dashboard : data.dashboard.toString(),
      work_shift : data.work_shift.toString(),
      realtime_activity : data.realtime_activity.toString(),
      operation_analysis : data.operation_analysis.toString(),
      illegal_disposal : data.illegal_disposal.toString(),
      driving_diary : data.driving_diary.toString(),
      notification : data.notification.toString(),
      user_management : data.user_management.toString(),
      staff_management : data.staff_management.toString(),
      vehicle_management : data.vehicle_management.toString(),
      absence_management : data.absence_management.toString(),
      company_management : data.company_management.toString(),
      route_management : data.route_management.toString(),
      updater_application_management : data.updater_application_management.toString()
    }
  }
}
