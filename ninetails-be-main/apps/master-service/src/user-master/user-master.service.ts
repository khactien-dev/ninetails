import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { UserMasterEntity } from 'libs/entities/user-master.entity';
import {
  fetchUserDetail,
  getCurrentDate,
  hashPassword,
} from 'libs/utils/helper.util';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  ForgetPasswordReq,
  VerifyForgetPasswordReq,
} from '../dto/reset-password.dto';
import { OtpService } from '../otp/otp.service';
import { EUserRole, OTPTYPE } from 'libs/enums/common.enum';
import {
  ChangePasswordReq,
  CreateUserDto,
  UpdatePasswordReq,
  UpdateUserReq,
} from '../dto/user.dto';
import { TokenService } from '../token/token.service';
import { TenantEntity } from 'libs/entities/tenant.entity';
import { MailService } from '../mail/mail.service';
import { IJwtPayload } from '../payloads/jwt-payload.payload';
import * as moment from 'moment';
import * as crypto from 'crypto';
import {HttpService} from "@nestjs/axios";
import { ConfigService } from '@nestjs/config';
import {UserEntity} from "libs/entities/user.entity";
import {ComboBoxEntity} from "libs/entities/combo-box.entity";
import { responseHelper } from 'libs/utils/helper.util';
import { PermissionEntity } from 'libs/entities/permission.entity';

@Injectable()
export class UserMasterService {
  constructor(
    @InjectRepository(UserMasterEntity)
    private userMasterEntity: Repository<UserMasterEntity>,
    @InjectRepository(PermissionEntity)
    private permissionEntity: Repository<PermissionEntity>,
    @InjectRepository(TenantEntity)
    private tenantEntity: Repository<TenantEntity>,
    private dataSource: DataSource,
    private otpService: OtpService,
    private tokenService: TokenService,
    private mailService: MailService,
    private readonly httpService: HttpService,
    private configService: ConfigService
  ) {}

  async createWithTransaction(
    data: {
      password?: string;
      role: string;
      email: string;
      tenant_id: number;
      full_name: string;
      phone_number: string;
      permission_id: number;
    },
    manage?: EntityManager,
  ) {
    if (data.password) data.password = hashPassword(data.password);
    const check = await manage.findOne(UserMasterEntity, {
      where: { email: data.email },
    });
    if (check) throw new BadRequestException('Email is existed');

    const checkPhone = await manage.findOne(UserMasterEntity, {
      where: { phone_number: data.phone_number },
    });
    if (checkPhone) throw new BadRequestException('Phone is existed');

    return await manage.save(
      UserMasterEntity,
      manage.create(UserMasterEntity, data),
    );
  }

  async checkFullName(body) {
    let queryUserMaster = await this.getPhoneOrEmailByOption(body);
    const user = await this.findOne(queryUserMaster);
    let column = body.option == "email" ? "email" : "phone";
    if (!user) {
      throw new BadRequestException(
        `The SuperBucket User does not match with the ${column}. Please try again!`,
      );
    }
    console.log(user.full_name);
    if (user.full_name != body.full_name) {
      throw new BadRequestException(
        `The SuperBucket User does not match with the ${column}. Please try again!`,
      );
    }

    return user;
  }

  async findByEmailAndPassword(email: string, password: string) {
    const { entities, raw } = await this.userMasterEntity
      .createQueryBuilder('u')
      .addSelect(
        `PGP_SYM_DECRYPT(u.phone_number::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'phone_number',
      )
      .addSelect(
        `PGP_SYM_DECRYPT(u.full_name::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'full_name',
      )
      .leftJoinAndSelect('u.tenant', 't')
      .leftJoinAndSelect('t.contracts', 'c')
      .where(`u.email = '${email.toLocaleLowerCase()}'`)
      .orderBy('c.end_date', 'DESC')
      .limit(1)
      .getRawAndEntities();

    let [user] = entities.map((item) => {
      const rawItem = raw[0];
      item.role = rawItem.u_role;
      item.full_name = rawItem.full_name;
      item.tenant_id = rawItem.u_tenant_id;
      item.password = rawItem.u_password;
      item.phone_number = rawItem.phone_number;
      item.last_login = rawItem.u_last_login;
      item.tenant = {
        schema: rawItem.t_schema,
        contracts: [
          {
            start_date: rawItem.c_start_date,
            end_date: rawItem.c_end_date,
          },
        ] as any,
      } as any;
      item.permission = null;
      return item;
    });
    if (user.role !== EUserRole.ADMIN && raw[0].u_permission_id) {
      user.permission = await this.permissionEntity.findOne({
        where: { id: raw[0].u_permission_id },
      });
    }
    if (user) {
      const check = await compare(password, user.password);
      if (!check) user = null;
    }
    if (!user) {
      throw new BadRequestException(
        // 'Incorrect Email or password. Please try again!',
        '이메일 또는 비밀번호가 잘못되었습니다. 다시 시도해 주세요!',
      );
    }
    const response = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      tenant_id: user?.tenant_id,
      tenant: user?.tenant?.schema,
      contractEndDate: user?.tenant?.contracts[0]?.end_date,
      contractStartDate: user?.tenant?.contracts[0]?.start_date,
      permission: user?.permission,
    };
    if (user.role !== EUserRole.ADMIN) {
      const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
      const { entities, raw } = await this.tenantEntity
        .createQueryBuilder('t')
        .addSelect(
          `PGP_SYM_DECRYPT(c.end_date::bytea,'${this.configService.get('ENCRYPT_KEY')}')::timestamp`,
          'end_date',
        )
        .addSelect(
          `PGP_SYM_DECRYPT(c.start_date::bytea,'${this.configService.get('ENCRYPT_KEY')}')::timestamp`,
          'start_date',
        )
        .leftJoinAndSelect('t.contracts', 'c')
        .where(
          `t.id = ${user.tenant_id} and 
          PGP_SYM_DECRYPT(c.end_date::bytea,'${this.configService.get('ENCRYPT_KEY')}')::timestamp > '${currentDate}'::timestamp 
          and PGP_SYM_DECRYPT(c.start_date::bytea,'${this.configService.get('ENCRYPT_KEY')}')::timestamp <= '${currentDate}'::timestamp 
          and c.status = 1`,
        )
        .limit(1)
        .getRawAndEntities();
      const tenant = entities[0];
      if (!tenant) {
        throw new UnauthorizedException('Account deactivated!');
      }
      tenant.contracts[0].start_date = raw[0].start_date;
      tenant.contracts[0].end_date = raw[0].end_date;
      const checkUserStatus: { status: number }[] = await this.dataSource.query(
        `select status from "${tenant.schema}".users where master_id = ${user.id}`,
      );
      if (checkUserStatus?.length < 1 || !checkUserStatus[0]?.status) {
        throw new UnauthorizedException('Account deactivated!');
      }
      response.tenant = tenant.schema;
      response.contractStartDate = tenant.contracts[0]?.start_date;
      response.contractEndDate = tenant.contracts[0]?.end_date;

      const isFirstLogin = user.last_login == null;

      if (isFirstLogin) {
        user.tenant = tenant.schema as any;
        const createTokenChangePass =
          await this.tokenService.createChangePasswordToken(user);
        throw new BadRequestException({
          message: 'Please change your password the first time you login',
          api: 'api/user-master/change-password-first-login',
          first_login: true,
          token: createTokenChangePass,
          statusCode: 400,
        });
      } else {
        await this.lastLogin(user);
      }
    }
    return response;
  }

  async updatePassword(id: number, data: UpdatePasswordReq) {
    const user = await this.userMasterEntity.findOne({
      where: { id: id },
    });
    if (!user) {
      throw new BadRequestException('User does not exits. Please try again!');
    }

    await this.userMasterUpdatePassword(user.id, data.password);
  }

  async changePassword(id: number, data: ChangePasswordReq) {
    const user = await this.userMasterEntity.findOne({
      where: { id: id },
    });
    if (!user) {
      throw new BadRequestException('User does not exits. Please try again!');
    }
    if (!user.password) {
      throw new BadRequestException(
        // 'Incorrect Password. Please try again!'
        '비밀번호가 잘못되었습니다. 다시 시도해 주세요!',
      );
    }
    const check = await compare(data.passwordOld, user.password);

    if (!check) {
      throw new BadRequestException(
        // 'Incorrect Password. Please try again!'
        '비밀번호가 잘못되었습니다. 다시 시도해 주세요!',
      );
    }

    await this.userMasterUpdatePassword(user.id, data.passwordNew);
  }

  async sendAndCheckResetPass(data: ForgetPasswordReq) {
    await this.checkFullName(data);
    let dataQuery: any = await this.getPhoneOrEmailByOption(data);
    await this.otpService.deleteOTPBy(dataQuery);
    dataQuery.type = OTPTYPE.FORGOT_PASSWORD;
    dataQuery.is_resend = true;
    return await this.otpService.createOTP(dataQuery);
  }

  async verifyAccountForgotPassword(query: VerifyForgetPasswordReq) {
    await this.checkFullName(query);
    let dataFindOTP: any = await this.getPhoneOrEmailByOption(query);
    dataFindOTP.type = OTPTYPE.FORGOT_PASSWORD;
    dataFindOTP.code = query.code;
    const otp = await this.otpService.findOneOTP(
        dataFindOTP,
      false,
    );

    if (!otp) {
      throw new BadRequestException(
        // 'Please enter a valid verification code'
        '유효한 인증 코드를 입력해 주세요',
      );
    }
    const dateNow = new Date();
    if (dateNow.getTime() - otp.createdAt.getTime() > 1000 * 60 * 5) {
      throw new BadRequestException(
        // 'Verification code has expired'
        '인증 코드가 만료되었습니다.',
      );
    }

    await this.otpService.deleteOTPBy({ code: otp.code });
    let dataCreateOTP: any = await this.getPhoneOrEmailByOption(query);
    dataCreateOTP.type = OTPTYPE.RESET_PASSWORD;
    dataCreateOTP.is_resend = true;
    return await this.otpService.createOTP(dataCreateOTP);
  }

  async resetPassword(otp, password: string) {
    let query;
    if (otp.email) {
      query = {email: otp.email}
    } else {
      query = {phone_number: otp.phone_number}
    }
    // const user = await this.userMasterEntity.findOne({
    //   where: query,
    // });
    const user = await this.findOne(query);
    if (!user) {
      throw new BadRequestException(
        'The SuperBucket User does not match with the email. Please try again!',
      );
    }

    await this.userMasterUpdatePassword(user.id, password);
  }

  async findByRole(role: string) {
    return await this.userMasterEntity.findOne({
      where: { role },
    });
  }

  async update(criteria: { id?: number; email?: string }, data: UpdateUserReq) {
    if (data.password) data.password = hashPassword(data.password);
    return await this.userMasterEntity.update(criteria, data);
  }

  async saveAdmin(createUserDto: CreateUserDto) {
    const hash = hashPassword(createUserDto.password);
    return this.userMasterEntity.save({
      ...createUserDto,
      password: hash,
    });
  }

  async findOneWithContract(id: number) {
    const raw = await this.userMasterEntity
      .createQueryBuilder('um')
      .addSelect(
        `PGP_SYM_DECRYPT(um.full_name::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'full_name',
      )
      .addSelect(
        `PGP_SYM_DECRYPT(um.phone_number::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'phone_number',
      )
      .leftJoinAndSelect('um.tenant', 't')
      .leftJoinAndSelect('t.contracts', 'c')
      .where(`um.id = ${id}`)
      .orderBy('c.end_date', 'DESC')
      .limit(1)
      .getRawOne();
    if (!raw) throw new NotFoundException('User Not Found');
    return {
      id: raw.um_id,
      role: raw.um_role,
      password: raw.um_password,
      email: raw.um_email,
      phone_number: raw.phone_number,
      full_name: raw.full_name,
      organization: raw.um_organization,
      tenant_id: raw.um_tenant_id,
      tenant: {
        schema: raw.t_schema,
      },
      permission_id: raw.um_permission_id,
      permission: undefined,
    };
  }

  async checkAvailableByEmail(email: string) {
    const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const user = await this.userMasterEntity
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.tenant', 't')
      .leftJoinAndSelect('t.contracts', 'c')
      .where(
        `u.email = '${email}' and 
        PGP_SYM_DECRYPT(c.end_date::bytea,'${this.configService.get('ENCRYPT_KEY')}')::timestamp > '${currentDate}'::timestamp and 
        PGP_SYM_DECRYPT(c.start_date::bytea,'${this.configService.get('ENCRYPT_KEY')}')::timestamp < '${currentDate}'::timestamp 
        and c.status = 1`,
      )
      .orderBy('c.end_date', 'DESC')
      .limit(1)
      .getOne();
    if (!user) {
      throw new ForbiddenException('Account deactivated!');
    }
    return user;
  }

  async checkRefreshToken(refreshToken: string) {
    try {
      const payload = await this.tokenService.verifyToken(refreshToken);
      delete payload.iat;
      delete payload.exp;
      const user = await this.findOneWithContract(+payload.id);
      const res: IJwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      };
      if (user.role !== EUserRole.ADMIN && !payload.opLogin) {
        const currentDate = getCurrentDate();
        const tenant = await this.tenantEntity
          .createQueryBuilder('t')
          .leftJoinAndSelect('t.contracts', 'c')
          .where(
            `t.id = ${user.tenant_id} and c.end_date::timestamp > '${currentDate}'::timestamp and 
            c.start_date::timestamp < '${currentDate}'::timestamp and c.status = 1`,
          )
          .limit(1)
          .getOne();
        if (!tenant) {
          throw new Error('deactivated');
        }
        if (user.role !== EUserRole.ADMIN && user.permission_id) {
          res.permission = await this.permissionEntity.findOne({
            where: { id: user.permission_id },
          });
        }
        res.tenant = tenant.schema;
        res.contractStartDate = tenant.contracts[0]?.start_date;
        res.contractEndDate = tenant.contracts[0]?.end_date;
        res.tenant_id = tenant.id;
      }
      if (payload.opLogin) {
        res.tenant = user?.tenant?.schema;
        res.tenant_id = user?.tenant_id;
        res.role = EUserRole.ADMIN;
      }
      return this.tokenService.createLoginToken(res);
    } catch (error) {
      if (error.message === 'deactivated') {
        throw new ForbiddenException('Account deactivated!', 'REFRESH_FAIL');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async findOne(
    data: {
      email?: string;
      id?: number;
      tenant_id?: number;
      role?: EUserRole;
      phone_number?: string;
    },
    checkNotFound = true,
  ) {
    const queryBuilder = this.userMasterEntity
      .createQueryBuilder('um')
      .addSelect(
        `PGP_SYM_DECRYPT(um.full_name::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'full_name',
      )
      .addSelect(
        `PGP_SYM_DECRYPT(um.phone_number::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'phone_number',
      )
      .leftJoinAndSelect('um.tenant', 't');
    if (data.phone_number) {
      queryBuilder.where(
        `PGP_SYM_DECRYPT(um.phone_number::bytea, '${this.configService.get('ENCRYPT_KEY')}') = '${data.phone_number}'`,
      );
    } else {
      queryBuilder.where(
        `um.${Object.keys(data)[0]} = '${Object.values(data)[0]}'`,
      );
    }
    const raw = await queryBuilder.getRawOne();
    if (!raw) {
      if (!checkNotFound) {
        return null;
      } else {
        throw new NotFoundException('User Not Found');
      }
    }
    const userData = {
      id: raw.um_id,
      role: raw.um_role,
      password: raw.um_password,
      email: raw.um_email,
      phone_number: raw.phone_number,
      full_name: raw.full_name,
      organization: raw.um_organization,
    } as any;
    return {
      ...userData,
      tenant: userData.role !== 'ADMIN' ? userData?.tenant?.organization : null,
    };
  }

  async getIdBySchemaName(name: string) {
    return this.tenantEntity.findOneBy({
      schema: name,
    });
  }

  async loginToOpByAdmin(id: number) {
    const user = await this.findOneWithContract(id);
    return await this.tokenService.createLoginToken(
      {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: EUserRole.ADMIN,
        tenant: user.tenant?.schema,
        tenant_id: user.tenant_id,
      },
      true,
    );
  }

  async lastLogin(user) {
    user.last_login = new Date();
    return await this.userMasterEntity.update(user.id, {
      last_login: user.last_login,
    });
  }

  async userMasterUpdatePassword(id: number, password: string) {
    const newPass = hashPassword(password);
    const newDate = new Date();
    return await this.userMasterEntity.update(
      { id: id },
      {
        password: newPass,
        last_login: newDate,
      },
    );
  }

  async detailUser(req: Request) {
    if (
      req['auth']?.role == EUserRole.ADMIN &&
      req['auth']?.tenant == undefined
    ) {
      let user = await this.findOne({
        id: req['auth']?.id,
      });
      if (req.headers['opid']) {
        user = (
          await fetchUserDetail(
            req.headers['authorization'],
            req.headers['schema'] ?? req['auth']?.tenant,
            req.headers['opid'],
          )
        ).data;
      }
      return {
        ...user,
        first_login: false,
        password: undefined,
      };
    } else {
      const user = await fetchUserDetail(
        req.headers['authorization'],
        req.headers['schema'] ?? req['auth']?.tenant,
      );

      return { ...(user.data ?? null) };
    }
  }

  async sendSMS(phone, otp, subject) {
    let space = " ";            // one space
    let newLine = "\n";             // new line
    let method = "POST";            // method
    let serviceId = this.configService.get('SMS_SERVICE_ID');
    let accessKey = this.configService.get('SMS_ACCESS_KEY');          // access key id (from portal or Sub Account)
    let secretKey = this.configService.get('SMS_SECRET_KEY');          // secret key (from portal or Sub Account)
    let uri = "/sms/v2/services/"+serviceId+"/messages";   // url (include query string)
    let url = "https://sens.apigw.ntruss.com/sms/v2/services/"+serviceId+"/messages";
    let timestamp = moment().utc().valueOf().toString();         // current timestamp (epoch)
    let hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(method);
    hmac.update(space);
    hmac.update(uri);
    hmac.update(newLine);
    hmac.update(timestamp);
    hmac.update(newLine);
    hmac.update(accessKey);
    let signature = hmac.digest('base64');
    let data = {
      "type":"SMS",
      "contentType":"COMM",
      "countryCode":"82",
      "from": this.configService.get('SMS_FROM'),
      "content": "비밀번호 재설정을 위한 OTP:"+otp+"\n" +
          "이 OTP는 5분 후에 만료됩니다.",
      "messages":[
        {
          "to": phone,
          "subject": subject,
        }
      ]
    };
    let config = {
      headers: {
        'Content-Type': "application/json",
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': accessKey,
        'x-ncp-apigw-signature-v2': signature,
      }
    }

    try {
      const response = await this.httpService.axiosRef.post(url,data, config);
      return responseHelper(response.data, true, 200);
    } catch (error) {
      return responseHelper(error.response.data, false, 500);
    }
  }

  async getUserByTenant(tenant, email) {
    try {
      const AppDataSource = new DataSource({
        type: process.env.DATABASE_TYPE as any,
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DATABASE,
        schema: tenant,
        entities: [
          UserEntity,
          ComboBoxEntity,
        ],
        synchronize: true,
      });
      await AppDataSource.initialize();
      return await AppDataSource.manager
          .createQueryBuilder(UserEntity, 'u')
          .where('email = :email', { email: email })
          .getOne();
    } catch (e) {
      return null;
    }
  }

  async getTenantById(id) {
    return this.tenantEntity.findOneBy({
      id: id,
    });
  }

  async getPhoneOrEmailByOption(body) {
    if (body.option == 'email') {
      if (!body.email) {
        throw new BadRequestException(
            'The SuperBucket User does not match with the email. Please try again!',
        );
      }
      return {email: body.email.toLowerCase()}
    }

    if (!body.phone_number) {
      throw new BadRequestException(
          'The SuperBucket User does not match with the phone. Please try again!',
      );
    }
    return {phone_number: body.phone_number}
  }
}
