import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateUserReq,
  CreateUserRes,
  DeleteUserReq,
  PermissionRes,
  SearchUserReq,
  UpdateStatusUsersReq,
  UpdateUserInfoReq,
  UpdateUserReq,
} from '../dto/user.dto';
import {
  handlePaginate,
  responseHelper,
  setDefaultQuerySearchValues,
} from 'libs/utils/helper.util';
import { UserService } from './user.service';
import { MailService } from '../mail/mail.service';
import {
  ResetMultiPasswordReq,
  UpdateInformationReq,
} from '../../../master-service/src/dto/user.dto';
import { LgoRes, LogoReq } from '../dto/logo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '../../../master-service/src/file/file.service';
import { ESORTUSER, EUserRole } from 'libs/enums/common.enum';

@ApiTags('User')
@Controller('')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private mailService: MailService,
    private fileService: FileService,
  ) {}

  @Get()
  @ApiOkResponse({ type: CreateUserRes })
  async getAllUsers(
    @Query() query: SearchUserReq,
    @Request()
    req: {
      auth: { tenant_id: number; tenant: string };
      headers: { schema: string };
    },
  ) {
    query.tenant_id = req.auth?.tenant_id;
    query.schema = req.auth.tenant || req.headers.schema;
    if (query.sortField === ESORTUSER.PERMISSION) {
      query.sortField = ESORTUSER.ROLE;
    }
    const handlePage = handlePaginate(query);
    const param = setDefaultQuerySearchValues(query);
    const { users, total } = await this.userService.getAllUsers(
      param,
      handlePage,
    );
    return responseHelper({
      data: users,
      pagination: {
        total,
        last_page: Math.ceil(total / +query.pageSize),
        per_page: query.pageSize,
        current_page: query.page,
      },
    });
  }

  @Get('/detail')
  @ApiOkResponse({ type: CreateUserRes })
  async detail(@Request() req: { auth: { id: number } }) {
    const user = await this.userService.findByMasterId(
      +(req['headers']['opid'] || req.auth?.id),
    );
    return responseHelper({ ...user, password: undefined });
  }

  @Post('create')
  @ApiOkResponse({ type: CreateUserRes })
  async create(
    @Body() body: CreateUserReq,
    @Request() req: { auth: { tenant_id: number }; headers: { opid: string } },
  ) {
    body.tenant_id = req.auth.tenant_id;
    if (req.headers.opid) {
      body.tenant_id = (
        await this.userService.findByMasterId(+req.headers.opid)
      ).tenant_id;
    }
    const { user, randomPass, organization } =
      await this.userService.createWithTransaction(body);
    this.mailService.sendPasswordWhenCreateUser({
      email: body.email,
      newPass: randomPass,
      operator: user.full_name,
      organization,
    });
    return responseHelper(user);
  }

  @Put('update/:id')
  @ApiOkResponse({ type: UpdateUserReq })
  async update(
    @Param('id') id: number,
    @Body() body: UpdateUserReq,
    @Request() req: { auth: { id: number } },
  ) {
    const user = await this.userService.update(id, body, req.auth?.id);
    return responseHelper(user);
  }

  @Put('update-status')
  @ApiOkResponse({ type: UpdateUserReq })
  async updateStatus(@Body() body: UpdateStatusUsersReq) {
    const user = await this.userService.updateStatus(body);
    return responseHelper(user);
  }

  @Delete('delete-users')
  @ApiOkResponse({ type: UpdateUserReq })
  async delete(@Body() body: DeleteUserReq) {
    const user = await this.userService.delete(body);
    return responseHelper(user);
  }

  @Put('update-information')
  @ApiCreatedResponse({ type: UpdateInformationReq })
  async updateInformation(
    @Request()
    req: { auth: { id: number; email: string }; headers: { opid: number } },
    @Body() body: UpdateUserInfoReq,
  ) {
    let id = req.auth?.id;
    let email = req.auth?.email;
    if (req.headers?.opid) {
      id = req.headers.opid;
      email = undefined;
    }

    const user = await this.userService.checkIdUser(id, email);
    const updateUser = await this.userService.update(user.id, body);
    return responseHelper(updateUser);
  }

  @Post('reset-multi-password')
  @ApiOkResponse({ type: UpdateUserReq })
  async resetMultiPassword(@Body() body: ResetMultiPasswordReq) {
    const user = await this.userService.resetMultiPassword(body);
    return responseHelper(user);
  }

  @Post('upload-logo')
  @ApiOkResponse({ type: LgoRes })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async uploadLogo(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: LogoReq,
    @Request() req: any,
  ) {
    const role = [EUserRole.ADMIN, EUserRole.BACKUP, EUserRole.OP];
    if (!role.includes(req['auth'].role)) {
      throw new ForbiddenException('Forbidden Role');
    }

    if (image) {
      const upload = await this.fileService.uploadImage(image);
      body.image = upload.url;
      body.name = upload.name;
    }

    const newImage = await this.userService.saveLogo(body);
    return responseHelper(newImage);
  }

  @Get('/get-permissions')
  @ApiOkResponse({ type: PermissionRes })
  async getPermissionsBySchema(@Request() req: any) {
    let tenantId = req.auth?.tenant_id;
    if (req.auth?.role == EUserRole.ADMIN) {
      tenantId = await this.userService.getTenantId(req.headers?.opid);
    }
    const permissions = await this.userService.getPermissionsBySchema(tenantId);
    return responseHelper(permissions);
  }
}
