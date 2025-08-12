import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from 'libs/entities/user.entity';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { TokenService } from '../token/token.service';
import { JwtModule } from '@nestjs/jwt';
import { StaffModule } from '../staff/staff.module';
import { UserRepository } from './user.repository';
import { AuthMiddleware } from '../guards/auth.middleware';
import { ComboBoxModule } from '../combo-box/combo-box.module';
import {
  RoleBackUpMiddleware,
  RoleOpMiddleware,
} from '../guards/role.middleware';
import { FileService } from '../../../master-service/src/file/file.service';
import { LogoEntity } from 'libs/entities/logo.entity';
import {
  UserCreateMiddleware,
  UserDeleteMiddleware,
  UserReadMiddleware,
  UserUpdateMiddleware,
} from '../guards/user.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, LogoEntity]),
    JwtModule,
    StaffModule,
    ComboBoxModule,
  ],
  providers: [
    UserService,
    ...DataSourceProvider,
    TokenService,
    UserRepository,
    FileService,
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(UserController);
    consumer.apply(UserReadMiddleware).forRoutes(
      { path: '/', method: RequestMethod.ALL },
      // { path: '/detail', method: RequestMethod.ALL },
    );
    consumer
      .apply(UserCreateMiddleware)
      .forRoutes({ path: 'create', method: RequestMethod.ALL });
    consumer.apply(UserUpdateMiddleware).forRoutes(
      {
        path: 'update/*',
        method: RequestMethod.ALL,
      },
      { path: 'update-status/', method: RequestMethod.ALL },
    );
    consumer
      .apply(UserDeleteMiddleware)
      .forRoutes({ path: '/delete-users', method: RequestMethod.ALL });
  }
}
