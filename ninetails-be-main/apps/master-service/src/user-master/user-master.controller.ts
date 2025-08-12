import { Body, Controller, Get, Post, Put, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  ChangePasswordReq,
  CreateUserRes,
  UpdatePasswordReq,
  UpdateUserReq,
} from '../dto/user.dto';
import { responseHelper } from 'libs/utils/helper.util';
import { UserMasterService } from './user-master.service';
import { OpLoginDto } from '../dto/login.dto';
import { EUserRole } from 'libs/enums/common.enum';
import { UserFixService } from './user.fix';

@ApiTags('User Management')
@Controller('user-master')
@ApiBearerAuth()
export class UserMasterController {
  constructor(
    private readonly userMasterService: UserMasterService,
    private userFixService: UserFixService,
  ) {}

  @Get('/detail')
  @ApiOkResponse({ type: CreateUserRes })
  async detail(@Request() req: Request) {
    const user = await this.userMasterService.detailUser(req);
    return responseHelper(user);
  }

  @Put('change-password-first-login')
  @ApiOkResponse({ type: UpdateUserReq })
  async updatePassword(
    @Request()
    req: {
      auth: { id: any };
    },
    @Body() body: UpdatePasswordReq,
  ) {
    const id = req.auth?.id;
    const user = await this.userMasterService.updatePassword(id, body);
    return responseHelper(user);
  }

  @Put('change-password')
  @ApiOkResponse({ type: UpdateUserReq })
  async changePassword(
    @Request()
    req: {
      auth: { id: any };
      headers: {
        opid: number;
      };
    },
    @Body() body: ChangePasswordReq,
  ) {
    const id = req.headers?.opid || req.auth?.id;

    const user = await this.userMasterService.changePassword(id, body);
    return responseHelper(user);
  }

  // @Post('op-login')
  // @ApiCreatedResponse({ type: LoginResponse })
  // async opLogin(@Body() body: OpLoginDto, @Request() req: Request) {
  //   if (req['auth']?.role !== EUserRole.ADMIN) {
  //     throw new UnauthorizedException('UnAuthorized');
  //   }
  //   return responseHelper(
  //     await this.userMasterService.loginToOpByAdmin(body.opId),
  //   );
  // }

  @Post('/fix-user-master')
  async fixUserMasterNull() {
    return await this.userFixService.fixTenantNull();
  }

  @Post('/sync-encrypt')
  async syncEncrypt() {
    return await this.userFixService.syncUserFromMaster();
  }
}
