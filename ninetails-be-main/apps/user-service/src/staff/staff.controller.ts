import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateStaffReq,
  CreateStaffRes,
  DeleteStaffReq,
  SearchStaffReq,
  UpdateStaffReq,
} from '../dto/staff.dto';
import {
  responseHelper,
  setDefaultQuerySearchValues,
} from 'libs/utils/helper.util';
import { compare } from 'bcrypt';
import { DataSource } from 'typeorm';

@ApiTags('Staff')
@Controller('staff')
@ApiBearerAuth()
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private dataSource: DataSource,
  ) {}

  @Get()
  @ApiCreatedResponse({ type: CreateStaffRes })
  async getAllStaffs(@Query() payload: SearchStaffReq) {
    const query = setDefaultQuerySearchValues(payload);
    const { staffs, total } = await this.staffService.getAll(query);
    return responseHelper({
      data: staffs,
      pagination: {
        total,
        last_page: Math.ceil(total / +query.pageSize),
        per_page: query.pageSize,
        current_page: query.page,
      },
    });
  }

  @Get('ignore-resigned-status')
  @ApiCreatedResponse({ type: CreateStaffRes })
  async getActiveStaff(@Request() req: { auth: { id: number } }) {
    return responseHelper(await this.staffService.ignoreResignedStatus());
  }

  @Get(':id')
  @ApiCreatedResponse({ type: CreateStaffRes })
  async detail(@Param('id') id: number) {
    const staff = await this.staffService.detail(id);
    return responseHelper(staff);
  }

  @Post('create')
  @ApiCreatedResponse({ type: CreateStaffRes })
  async create(@Body() body: CreateStaffReq) {
    const staff = await this.staffService.create(body);
    return responseHelper(staff);
  }

  @Put('update/:id')
  @ApiCreatedResponse({ type: CreateStaffRes })
  async update(
    @Param('id') id: number,
    @Body() body: UpdateStaffReq,
    @Request() req: { headers: { schema: string } },
  ) {
    const staff = await this.staffService.update(id, body, req.headers.schema);
    return responseHelper(staff);
  }

  @Delete('delete')
  @ApiCreatedResponse({ type: CreateStaffRes })
  async delete(
    @Body() body: DeleteStaffReq,
    @Request()
    req: { headers: { schema: string }; auth: { adminId: number; id: number } },
  ) {
    const userId = req['auth']?.adminId || req['auth']?.id;
    const user = await this.dataSource.query(
      `select id, password from public.users_master where id = ${userId}`,
    );
    if (user.length < 1) throw new BadRequestException('User not found');
    const check = await compare(body.password, user[0].password);
    if (!check) {
      throw new BadRequestException(
        // 'Incorrect Password. Please try again!'
        '비밀번호가 잘못되었습니다. 다시 시도해 주세요!',
      );
    }
    const staff = await this.staffService.delete(body, req.headers.schema);
    return responseHelper(staff);
  }
}
