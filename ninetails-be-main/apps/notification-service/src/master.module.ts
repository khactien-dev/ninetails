import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompleteRouteEntity } from 'libs/entities/complete-route.entity';
import {NotificationModule} from "./notification/notification.module";

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot({
      type: (process.env.DATABASE_TYPE as any) ?? 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [CompleteRouteEntity],
      autoLoadEntities: true,
      synchronize: true,
    }),
    NotificationModule,
  ]
})
export class MasterModule {}
