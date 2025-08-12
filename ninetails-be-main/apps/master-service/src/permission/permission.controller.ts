import {
  Body,
  Controller, Delete,
  Get, Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import {responseHelper} from "libs/utils/helper.util";
import {CreatePermissionReq, PermissionRes} from "../dto/permission.dto";

@ApiTags('Permission Management')
@Controller('permission')
@ApiBearerAuth()
export class PermissionController {
  constructor(
    private permissionService: PermissionService,
  ) {}

  @Get('/:tenant_id')
  @ApiOkResponse({ type: PermissionRes })
  async getByTenant(@Param('tenant_id') tenant_id: number) {
    const permissions = await this.permissionService.getByTenant(tenant_id);
    return responseHelper(permissions);
  }

  @Post()
  @ApiOkResponse({ type: PermissionRes })
  async create(@Body() body: CreatePermissionReq) {
    const permission = await this.permissionService.create(body);
    return responseHelper(permission);
  }

  @Put(':id')
  @ApiOkResponse({ type: CreatePermissionReq })
  async update(@Param('id') id: number, @Body() body: CreatePermissionReq) {
    const permission = await this.permissionService.update(id, body);
    return responseHelper(permission);
  }

  @Delete(':id')
  async deleteTenant(@Param('id') id: number) {
    return responseHelper(await this.permissionService.delete(id));
  }
}
