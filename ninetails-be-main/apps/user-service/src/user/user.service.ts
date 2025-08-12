import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from '../../../../libs/entities/user.entity';
import {
  formatLastLogin,
  hashPassword,
  randomPassword,
} from 'libs/utils/helper.util';
import {
  CreateUserDto,
  CreateUserReq,
  DeleteUserReq,
  Email,
  SearchUserReq,
  UpdateStatusUsersReq,
  UpdateUserReq,
} from '../dto/user.dto';
import { StaffService } from '../staff/staff.service';
import {
  DataSource,
  FindOneOptions,
  FindOptionsWhere,
  In,
  Not,
  Repository,
} from 'typeorm';
import { StaffEntity } from 'libs/entities/staff.entity';
import { IPaginate } from 'libs/common/common.interface';
import { ESORTUSER, EUserRole } from 'libs/enums/common.enum';
import { ComboBoxService } from '../combo-box/combo-box.service';
import { ResetMultiPasswordReq } from '../../../master-service/src/dto/user.dto';
import { MailService } from '../mail/mail.service';
import { SettingNotificationEntity } from 'libs/entities/setting-notification.entity';
import { LogoReq } from '../dto/logo.dto';
import { LogoEntity } from 'libs/entities/logo.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPO') private userRepository: Repository<UserEntity>,
    @Inject('LOGO_REPO') private logoRepository: Repository<LogoEntity>,
    private staffService: StaffService,
    private comboBoxService: ComboBoxService,
    private mailService: MailService,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    return {
      salt,
      hashPassword,
    };
  }

  async saveAdmin(createUserDto: CreateUserDto) {
    const hashPassword = (await this.hashPassword(createUserDto.password))
      .hashPassword;
    return this.userRepository.save({
      ...createUserDto,
      password: hashPassword,
    });
  }

  async checkExistEmail(email: string) {
    return await this.userRepository.findOneBy({
      email: email.toLowerCase(),
    });
  }

  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  findOneRole(options: FindOneOptions<UserEntity>) {
    return this.userRepository.findOne(options);
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository
      .createQueryBuilder('us')
      .where('us.email = :email', { email })
      .getOne();

    if (!user) {
      throw new BadRequestException('Email Not Exits');
    }

    return user;
  }

  async checkEmailAndFullName(data: { email: string; full_name: string }) {
    const user = await this.userRepository.findOne({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new BadRequestException(
        'The SuperBucket User does not match with the email. Please try again!',
      );
    }

    if (user.full_name != data.full_name) {
      throw new BadRequestException(
        'The SuperBucket User does not match with the email. Please try again!',
      );
    }

    return user;
  }

  async getAllUsers(criteria: SearchUserReq, paginate: IPaginate) {
    paginate.order = { u_id: criteria.sortBy };
    let whereStr = '';
    if (criteria.email) {
      whereStr += `u.email like '%${criteria.email}%'`;
      // whereStr += `PGP_SYM_DECRYPT(u.email::bytea, 'thisisverystrongkey') like '%${criteria.email}%'`;
    }
    if (criteria.sortField === ESORTUSER.LASTLOGIN) {
      const masters: { id: number }[] = await this.dataSource.query(
        `SELECT id FROM public.users_master WHERE tenant_id = ${criteria.tenant_id} 
        order by last_login ${criteria.sortBy || 'DESC'} 
        limit ${paginate.take} offset ${paginate.skip};`,
      );
      const idsStr = masters.reduce((p, c) => p + `${c.id},`, '');
      whereStr += `and u.master_id in (${idsStr.slice(0, idsStr.length - 1)})`;
      delete paginate.order;
    }
    if (criteria.sortField === ESORTUSER.DEPARTMENT) {
      paginate.order = { cd_data: criteria.sortBy };
    }
    if (criteria.sortField === ESORTUSER.POSITION) {
      paginate.order = { cp_data: criteria.sortBy };
    }
    if (criteria.sortField === ESORTUSER.STATUS) {
      paginate.order = {
        status: criteria.sortBy.toUpperCase() === 'DESC' ? 'ASC' : 'DESC',
      };
    }

    const [{ entities, raw }, total] = await Promise.all([
      this.userRepository
        .createQueryBuilder('u')
        .addSelect(
          `PGP_SYM_DECRYPT(u.phone_number::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
          'phone_number',
        )
        .addSelect(
          `PGP_SYM_DECRYPT(u.full_name::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
          'full_name',
        )
        .addSelect(
          `PGP_SYM_DECRYPT(cd.data::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
          'cd_data',
        )
        .addSelect(
          `PGP_SYM_DECRYPT(cp.data::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
          'cp_data',
        )
        .leftJoinAndSelect('u.comboboxDepartment', 'cd')
        .leftJoinAndSelect('u.comboboxPosition', 'cp')
        .where(whereStr)
        .orderBy(
          Object.keys(paginate.order)[0],
          Object.values(paginate.order)[0] as 'DESC' | 'ASC',
        )
        .skip(paginate.skip)
        .take(paginate.take)
        .getRawAndEntities(),
      this.dataSource.query(
        `SELECT COUNT(*) FROM "${criteria.schema}".users u ${whereStr ? 'where ' + whereStr : ''};`,
      ),
    ]);
    const users = entities.map((item) => {
      const rawItem = raw.find((r) => r.u_id === item.id);
      item.phone_number = rawItem.phone_number;
      item.full_name = rawItem.full_name;
      item.department = { data: rawItem.cd_data } as any;
      item.position = { data: rawItem.cp_data } as any;
      return item;
    });
    // const [users, total] = await this.userRepository.findAndCount({
    //   where,
    //   ...paginate,
    //   relations: ['comboboxDepartment', 'comboboxPosition'],
    // });
    if (users.length < 1) {
      return { users, total: +total[0].count };
    }
    const userMaster = users.map((user) => user.master_id);

    const masterIds = userMaster.join(',');
    const masters = await this.dataSource.query(
      `SELECT id, last_login, tenant_id, permission_id FROM public.users_master WHERE id IN (${masterIds});`,
    );

    const masterMap = {};
    const tenantMap = {};
    const lastLoginMap = {};
    const permissionMap = {};
    for (const master of masters) {
      masterMap[master.id] = formatLastLogin(master.last_login);
      lastLoginMap[master.id] = master.last_login;
      permissionMap[master.id] = await this.getPermissionId(
        master.permission_id,
      );
      tenantMap[master.id] = await this.getNameOrganizationFormTenant(
        master.tenant_id,
      );
    }

    const updatedUsers = users.map((user) => {
      const res = {
        ...user,
        last_login: masterMap[user.master_id] || null,
        timeLogin: lastLoginMap[user.master_id] || Infinity,
        department: user.comboboxDepartment || null,
        position: user.comboboxPosition || null,
        organization: tenantMap[user.master_id][0]['organization'] || null,
        permission: permissionMap[user.master_id] || null,
      };
      delete res.comboboxDepartment;
      delete res.comboboxPosition;
      return res;
    });
    if (criteria.sortField === ESORTUSER.LASTLOGIN) {
      updatedUsers.sort((p, c) =>
        criteria.sortBy.toLocaleLowerCase() === 'asc'
          ? c.timeLogin - p.timeLogin
          : p.timeLogin - c.timeLogin,
      );
    }
    if (criteria.sortField === ESORTUSER.ROLE) {
      updatedUsers.sort((p, c) => {
        const pPermissionName = p.permission?.name?.toLowerCase() || '';
        const cPermissionName = c.permission?.name?.toLowerCase() || '';

        return criteria.sortBy.toLocaleLowerCase() === 'asc'
          ? pPermissionName.localeCompare(cPermissionName)
          : cPermissionName.localeCompare(pPermissionName);
      });
    }
    return { users: updatedUsers, total: +total[0].count };
  }

  async create(createUserReq: CreateUserReq) {
    await this.findOneByEmail(
      {
        email: createUserReq.email,
      },
      true,
    );

    const user = new UserEntity();
    user.email = createUserReq.email.toLowerCase();
    // user.password = hashPassword(createUserReq.password);
    user.role = EUserRole.USER;
    user.full_name = createUserReq.full_name;
    user.phone_number = createUserReq.phone_number;
    user.department = createUserReq.department;
    user.position = createUserReq.position;
    user.status = createUserReq.status;
    user.master_id = createUserReq.master_id;

    if (
      createUserReq.staff_id &&
      (await this.checkStaffId(createUserReq.staff_id))
    ) {
      user.staff_id = createUserReq.staff_id;
    }
    const dataUser = this.userRepository.create(user);
    await this.userRepository.save(dataUser);

    // const { password, ...userWithoutPassword } = dataUser;

    return { user: dataUser };
  }

  async createWithTransaction(data: CreateUserReq) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const userMaster = await manage.query(
        `select email from public.users_master u where u.email = '${data.email}' and u.deleted_at is null`,
      );
      const checkTenant = await manage.query(
        `select email from public.tenant t where t.email = '${data.email}' and t.deleted_at is null`,
      );
      // const user = await manage
      //   .createQueryBuilder(UserEntity, 'u')
      //   .where(
      //     `PGP_SYM_DECRYPT(u.email::bytea, '${this.configService.get('ENCRYPT_KEY')}') = '${data.email}'`,
      //   )
      //   .getOne();
      const user = await manage.findOne(UserEntity, {
        where: { email: data.email },
      });
      if (userMaster.length > 0 || user || checkTenant.length > 0) {
        throw new BadRequestException(
          // 'This email is already taken. Please use a different one.',
          '이 이메일은 이미 사용 중입니다. 다른 이메일을 사용해 주세요.',
        );
      }

      const checkTenantPhone = await manage.query(
        `select phone_number from public.users_master u 
        where PGP_SYM_DECRYPT(u.phone_number::bytea, '${this.configService.get('ENCRYPT_KEY')}') = '${data.phone_number}' 
        and u.deleted_at is null`,
      );
      if (checkTenantPhone.length > 0) {
        throw new BadRequestException(
          // 'This phone is already taken. Please use a different one.',
          '이 전화번호는 이미 사용 중입니다. 다른 전화번호를 사용하세요.',
        );
      }

      if (data.staff_id) {
        const staff = await manage.findOne(StaffEntity, {
          where: { id: data.staff_id },
        });
        if (staff) delete data.staff_id;
      }
      const randomPass = randomPassword();
      const password = hashPassword(randomPass);
      const result = await manage.query(
        `insert into public.users_master (email, password, role, tenant_id, full_name, phone_number, permission_id) 
        values(PGP_SYM_ENCRYPT('${data.email}','${this.configService.get('ENCRYPT_KEY')}'),'${password}','${EUserRole.USER}',
        ${data.tenant_id}, PGP_SYM_ENCRYPT('${data.full_name}','${this.configService.get('ENCRYPT_KEY')}'), 
        PGP_SYM_ENCRYPT('${data.phone_number}','${this.configService.get('ENCRYPT_KEY')}'), '${data.permission_id}') 
        returning id;`,
      );
      data.master_id = result[0]?.id;
      const master = (
        await manage.query(
          `select * from public.users_master where id = ${data.master_id};`,
        )
      )[0];
      const create = await manage.save(
        UserEntity,
        manage.create(UserEntity, {
          ...data,
          role: EUserRole.USER,
          email: master.email,
          full_name: master.full_name,
          phone_number: master.phone_number,
        }),
      );

      await manage.save(
        SettingNotificationEntity,
        manage.create(SettingNotificationEntity, {
          user_id: create.master_id,
        }),
      );

      await queryRunner.commitTransaction();
      const tenant = await this.dataSource.query(
        `select t.organization, t.operator from public.tenant t where id = ${data.tenant_id}`,
      );
      return { user: create, randomPass, ...tenant[0] };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number) {
    const userData = await this.userRepository.findOneBy({ id });
    if (!userData) {
      throw new NotFoundException('User Not Found');
    }
    return userData;
  }

  async update(id: number, updateUserReq: UpdateUserReq, masterId?: number) {
    const user = await this.findOne(id);
    // if (updateUserReq.role && updateUserReq.role !== user.role) {
    //   if (user.role === EUserRole.BACKUP && user.master_id === masterId) {
    //     delete updateUserReq.role;
    //   }
    //   if (updateUserReq.role === EUserRole.BACKUP) {
    //     const check = await this.userRepository.findOne({
    //       where: { role: EUserRole.BACKUP },
    //     });
    //     if (check) {
    //       throw new BadRequestException(
    //         'Backup Operator already exists. Please choose a different role.',
    //       );
    //     }
    //   }
    // }
    const updatedMaster = await this.updateUserMaster(
      user.master_id,
      updateUserReq?.full_name,
      updateUserReq?.department,
      updateUserReq?.position,
      updateUserReq?.phone_number,
      updateUserReq?.permission_id,
    );

    if (
      updateUserReq.staff_id &&
      (await this.checkStaffId(updateUserReq.staff_id))
    ) {
      await this.userRepository.update(
        { id },
        { staff_id: updateUserReq?.staff_id },
      );
    }

    await this.userRepository.update(
      { id },
      {
        full_name: updatedMaster?.full_name,
        department: updateUserReq?.department,
        position: updateUserReq?.position,
        phone_number: updatedMaster?.phone_number,
        status: updateUserReq?.status,
      },
    );
    return await this.findOne(id);
  }

  async delete(body: DeleteUserReq) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const users = await manage.find(UserEntity, {
        where: { id: In(body.id), role: Not(EUserRole.OP) },
        select: ['master_id'],
      });
      if (users.length < body.id.length) {
        throw new BadRequestException('User not found');
      }
      await manage.softDelete(UserEntity, {
        id: In(body.id),
      });
      await manage.query(
        `UPDATE public.users_master SET deleted_at = NOW() WHERE id IN (${users.map((u) => u.master_id).join(',')});`,
      );
      await queryRunner.commitTransaction();
      return { message: 'Deletion process completed.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findOneByEmail(data: Email, throw_err = false) {
    const user = await this.userRepository.findOneBy({
      email: data.email,
    });
    if (throw_err) {
      const checkEmail = await this.userRepository.findOneBy({
        email: data.email.toLowerCase(),
      });

      if (checkEmail) {
        throw new BadRequestException(
          'err',
          // 'This email is already taken. Please use a different one.',
          '이 이메일은 이미 사용 중입니다. 다른 이메일을 사용해 주세요.',
        );
      }
    }
    return user;
  }

  async checkStaffId(id: number) {
    return await this.staffService.findOne(id);
  }

  async updateStatus(body: UpdateStatusUsersReq) {
    for (const id of body.id) {
      await this.findOne(id);
      await this.userRepository.update({ id }, { status: body.status });
    }

    return { message: 'Update status successfully' };
  }

  async checkIdUser(id: number, email?: string) {
    const where: FindOptionsWhere<UserEntity> = { master_id: id };
    if (email) where.email = email.toLowerCase();
    const users = await this.userRepository.findOneBy(where);

    if (!users) {
      throw new BadRequestException('User Not Found');
    }
    return users;
  }

  async updateUserMaster(
    id: number,
    full_name?: string,
    department?: number,
    position?: number,
    phone_number?: string,
    permission_id?: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const userMaster = await manage.query(
        `select id, role, email from public.users_master u where u.id = '${id}'`,
      );
      if (!userMaster[0]) {
        throw new BadRequestException('User not found');
      }

      const userMasterByPhone = await manage.query(
        `select id, role, email from public.users_master u where u.phone_number = '${phone_number}'`,
      );
      if (
        userMasterByPhone.length > 0 &&
        userMasterByPhone[0].email != userMaster[0].email
      ) {
        throw new BadRequestException(
          // 'This phone already exists'
          '이 전화번호는 이미 사용 중입니다. 다른 전화번호를 사용하세요.',
        );
      }

      if (full_name) {
        await manage.query(
          `UPDATE public.users_master SET 
          full_name= PGP_SYM_ENCRYPT('${full_name}','${this.configService.get('ENCRYPT_KEY')}') WHERE id = ${id}`,
        );
      }

      if (phone_number) {
        await manage.query(
          `UPDATE public.users_master SET 
          phone_number= PGP_SYM_ENCRYPT('${phone_number}','${this.configService.get('ENCRYPT_KEY')}') WHERE id = ${id}`,
        );
      }

      if (permission_id) {
        await manage.query(
          `UPDATE public.users_master SET permission_id = $1 WHERE id = $2`,
          [permission_id, id],
        );
      }
      const updatedMaster = await manage.query(
        `select * from public.users_master where id = '${id}'`,
      );
      if (userMaster[0]['role'] === EUserRole.OP) {
        // const updates = [];
        // const values = [];

        if (full_name) {
          manage.query(
            `UPDATE public.tenant SET operator = '${updatedMaster[0].full_name}' WHERE email = '${updatedMaster[0].email}'`,
          );
        }

        if (department) {
          manage.query(
            `UPDATE public.tenant SET department = ${department} WHERE email = '${updatedMaster[0].email}'`,
          );
        }

        if (position) {
          manage.query(
            `UPDATE public.tenant SET position = ${position} WHERE email = '${updatedMaster[0].email}'`,
          );
        }

        if (phone_number) {
          manage.query(
            `UPDATE public.tenant SET phone = '${updatedMaster[0].phone_number}' WHERE email = '${updatedMaster[0].email}'`,
          );
        }

        // if (updates.length > 0) {
        //   values.push(userMaster[0]['email']);
        //   const query = `UPDATE public.tenant SET ${updates.join(', ')} WHERE email = $${values.length}`;

        //   await manage.query(query, values);
        // }
      }

      await queryRunner.commitTransaction();
      return updatedMaster[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findByMasterId(id: number) {
    const { entities, raw } = await this.userRepository
      .createQueryBuilder('u')
      .addSelect(
        `PGP_SYM_DECRYPT(u.phone_number::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'phone_number',
      )
      .addSelect(
        `PGP_SYM_DECRYPT(u.full_name::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'full_name',
      )
      .where(`u.master_id = ${id}`)
      .getRawAndEntities();
    const userData = entities[0];
    userData.phone_number = raw[0].phone_number;
    userData.full_name = raw[0].full_name;
    const userMaster = await this.dataSource.query(
      `select last_login, tenant_id, permission_id from public.users_master u where u.id = '${id}'`,
    );

    const tenant = await this.getNameOrganizationFormTenant(
      userMaster[0]?.tenant_id,
    );

    const permission = await this.getPermissionId(userMaster[0]?.permission_id);

    if (!userData) {
      throw new NotFoundException('User Not Found');
    }

    const comboBoxDepartment = userData.department
      ? await this.findByComboBox(userData.department)
      : null;

    const comboBoxPosition = userData.position
      ? await this.findByComboBox(userData.position)
      : null;

    return {
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      deletedAt: userData.deletedAt,
      id: userData.id,
      full_name: userData.full_name,
      email: userData.email,
      phone_number: userData.phone_number,
      role: userData.role,
      department: comboBoxDepartment,
      position: comboBoxPosition,
      last_login: formatLastLogin(userMaster[0]['last_login']),
      status: userData.status,
      staff_id: userData.staff_id,
      master_id: userData.master_id,
      first_login: !userMaster[0]['last_login'],
      organization: tenant[0]['organization'] ?? null,
      tenant_id: userMaster[0]?.tenant_id,
      permission: permission ?? {},
    };
  }

  async findByComboBox(id) {
    return await this.comboBoxService.findOneById(id);
  }

  async getNameOrganizationFormTenant(id: number) {
    let tenant = null;
    if (id) {
      tenant = await this.dataSource.query(
        `SELECT organization FROM public.tenant WHERE id = '${id}'`,
      );
    }

    return tenant;
  }

  async getPermissionId(id: number) {
    let permission = null;
    if (id) {
      permission = await this.dataSource.query(
        `SELECT * FROM public.permission WHERE id = '${id}' LIMIT 1`,
      );
    }

    return permission[0];
  }

  async resetMultiPassword(ids: ResetMultiPasswordReq) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const users = await manage.find(UserEntity, {
        where: { id: In(ids.id) },
        select: ['master_id', 'email'],
      });
      if (users.length < ids.id.length) {
        throw new BadRequestException('User not found');
      }
      const randomPass = randomPassword();
      const password = hashPassword(randomPass);
      const userIds = users.map((u) => u.master_id).join(',');

      await manage.query(
        `UPDATE public.users_master SET password = $1, last_login = NULL WHERE id IN (${userIds});`,
        [password],
      );

      for (const user of users) {
        await this.mailService.sendPasswordWhenApprove(user.email, randomPass);
      }

      await queryRunner.commitTransaction();
      return { message: 'Reset Password completed.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async saveLogo(body: LogoReq) {
    let logo;
    const logos = await this.logoRepository.find();

    if (logos.length > 0) {
      const existingLogo = logos[0];
      await this.logoRepository.update(existingLogo.id, body);
      logo = await this.logoRepository.findOne({
        where: { id: existingLogo.id },
      });
    } else {
      const data = this.logoRepository.create(body);
      logo = await this.logoRepository.save(data);
    }

    return logo;
  }

  async getPermissionsBySchema(tenantId: number) {
    return await this.dataSource.query(
      `SELECT * FROM public.permission WHERE tenant_id = '${tenantId}' AND type is null`,
    );
  }

  async getTenantId(opId) {
    const users = await this.dataSource.query(
      `SELECT * FROM public.users_master WHERE id = '${opId}'`,
    );

    if (users.length < 1) {
      throw new BadRequestException('User not found');
    }

    return users[0].tenant_id;
  }
}
