import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as rabbit from 'rabbitmq-stream-js-client';
import { CompleteRouteEntity } from 'libs/entities/complete-route.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from 'libs/entities/tenant.entity';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment';
import { UserEntity } from 'libs/entities/user.entity';
import { DataSource, In } from 'typeorm';
import { ComboBoxEntity } from 'libs/entities/combo-box.entity';
import { StaffEntity } from 'libs/entities/staff.entity';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import { NotificationEntity } from 'libs/entities/notification.entity';
import { SettingNotificationEntity } from 'libs/entities/setting-notification.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AbsenceVehicleEntity } from 'libs/entities/absence-vehicle.entity';
import { RouteEntity } from 'libs/entities/route.entity';
import { AbsenceStaffEntity } from 'libs/entities/absence-staff.entity';
import { SectionEntity } from 'libs/entities/section.entity';
import { SegmentEntity } from 'libs/entities/segment.entity';
import { SegmentRouteMapEntity } from 'libs/entities/segment-route-map.entity';
import { CoreSectionEntity } from 'libs/entities/core-section.entity';
import { ECORESECTIONTYPE } from 'libs/common/constants/common.constant';
import {EdgeServeEntity} from "libs/entities/edge-serve.entity";
const { formatISO } = require('date-fns');

@Injectable()
export class NotificationService implements OnModuleInit {
  logger: Logger;
  client;
  constructor(
    private configService: ConfigService,
    @InjectRepository(CompleteRouteEntity)
    private CompleteRouteEntity: Repository<CompleteRouteEntity>,
    @InjectRepository(TenantEntity)
    private TenantEntity: Repository<TenantEntity>,
    private eventEmitter: EventEmitter2,
  ) {
    this.logger = new Logger();
    this.logger.log(`Notification client initialized with node`);
  }

  async onModuleInit() {
    try {
      this.client = await this.connectStream();
      const tenants = await this.TenantEntity.find();
      const schemaNames = tenants.map((a) => a.schema);
      const createStreamPromises = [];
      for (const schemaName of schemaNames) {
        if (schemaName == null) {
          continue;
        }
        createStreamPromises.push(
          this.client.createSuperStream({
            streamName: schemaName.toLowerCase(),
            arguments: { 'max-age': '1D' },
          }),
        );
      }
      await Promise.all(createStreamPromises);

      const consumerStreamPromises = [];
      for (const schemaName of schemaNames) {
        if (schemaName == null) {
          continue;
        }
        consumerStreamPromises.push(
          this.client.declareSuperStreamConsumer(
            {
              superStream: schemaName.toLowerCase(),
              offset: rabbit.Offset.next(),
              consumerRef: schemaName.toLowerCase(),
            },
            (message) => {
              console.log(JSON.parse(message.content.toString()));
              console.log("message ID :"+ message.messageProperties.messageId);
              this.processMessage(JSON.parse(message.content.toString()), message.messageProperties.messageId);
            },
          ),
        );
      }
      await Promise.all(consumerStreamPromises);
    } catch (e) {
      this.logger.error(`Exception occurred onModuleInit : ${e})`);
    }
  }

  async sendMessage(input) {
    const schema = input.schema.toLowerCase();
    const data = {
      customer_id: schema,
      route_id: input.route_id,
      drive_mode: input.drive_mode,
      segment_name: input.segment_name,
      segment_id: input.segment_id,
      section_name: input.section_name
    };
    const formatDate = moment().format("YYYYMMDD");

    try {
      const client = await this.connectStream();
      const routingKeyExtractor = (content, msgOptions) =>
        msgOptions.messageProperties.messageId;
      const publisher = await client.declareSuperStreamPublisher(
        { superStream: schema },
        routingKeyExtractor,
      );
      await publisher.send(Buffer.from(JSON.stringify(data)), {
        messageProperties: { messageId: formatDate+'-'+input.route_id },
      });
      await client.close();
      return data;
    } catch (e) {
      this.logger.error(`Send Rabbit : ${e})`);
      return {
        httpCode: 500,
        error: e,
      };
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async connectStream() {
    return await rabbit.connect({
      hostname: 'rabbitmq',
      port: 5552,
      username: this.configService.get<string>('RABBITMQ_USER'),
      password: this.configService.get<string>('RABBITMQ_PASS'),
      vhost: this.configService.get<string>('RABBITMQ_STREAM_VHOST'),
      addressResolver: {
        enabled: true,
        endpoint: {
          host: 'rabbitmq',
          port: 5552,
        },
      },
    });
  }

  async processMessage(data, routeIdHash) {
    const schemaName = data.customer_id.toLowerCase();
    const routeId = data.route_id;
    const route = await this.getRouteById(schemaName, routeId);
    let sectionNames = [];
    let segmentRoutes = [];
    let cores = [];
    if (!route) {
      return;
    }
    segmentRoutes = route.segment_routes;
    cores = route.cores;
    sectionNames = route.sections.map((a) => a.name);
    const segmentNameOfGarage = this.getSegmentNameByType(segmentRoutes, cores, ECORESECTIONTYPE.GARAGE);
    const segmentNameOfLandfill = this.getSegmentNameByType(segmentRoutes, cores, ECORESECTIONTYPE.LANDFILL);
    let edgeServe = await this.getEdgeServeByRoutId(schemaName, routeId);
    if (!edgeServe) {
      return;
    }
    const timestamp = new Date().getTime() - (edgeServe['operation_metrics'] * 4 * 1000);
    const timeDate = new Date(timestamp);
    const list = await this.getDataRabbitByTime(schemaName, routeIdHash, timeDate);
    if (list.length < 2) {
      if (data.segment_name == segmentNameOfGarage) {
        await this.sendNotification('back_to_parking', schemaName, routeId);
      }
      if (sectionNames.includes(data.section_name)) {
        await this.sendNotification('to_trash_collection_point', schemaName, routeId);
      }
      if (data.segment_name == segmentNameOfLandfill) {
        await this.sendNotification('to_landfill', schemaName, routeId);
      }
      await this.handleRabbitDriveMode7And8(schemaName, data, routeIdHash, edgeServe['operation_metrics']);
      await this.completeRoute(schemaName, routeIdHash, data.section_name, sectionNames, routeId);
      await this.startWorkingOfDispatchNo(routeIdHash, schemaName);
      return;
    }

    const latestData = list[list.length - 2];
    if (data.drive_mode == 0 && latestData.drive_mode == 0) {
      await this.startOtherOperations(schemaName, data, list);
    }

    if (latestData.drive_mode != data.drive_mode) {
      if (data.drive_mode > 0 && data.drive_mode <= 6 && latestData.drive_mode == 0) {
        await this.sendNotification('end_other_operations', schemaName, routeId,
        );
      }

      if (data.drive_mode == 6) {
        await this.sendNotification('start_standby_state', schemaName, routeId);
      }

      if (data.drive_mode >= 0 && data.drive_mode < 6 && latestData.drive_mode == 6) {
        await this.sendNotification('end_standby_state', schemaName, routeId);
      }
    }

    if (latestData.segment_name != data.segment_name) {
      if (data.segment_name == segmentNameOfGarage) {
        await this.sendNotification('back_to_parking', schemaName, routeId);
      }

      if (data.segment_name == segmentNameOfLandfill) {
        await this.sendNotification('to_landfill', schemaName, routeId);
      }

      await this.completeRoute(schemaName, routeIdHash, data.section_name, sectionNames, routeId);
    }

    if (latestData.section_name != data.section_name) {
      if (sectionNames.includes(data.section_name)) {
        await this.sendNotification('to_trash_collection_point', schemaName, routeId);
      }
    }

  }

  async startOtherOperations(schemaName, data, list) {
    if (list.length < 4) {
      return;
    }

    let checkMode = 0;
    for (let i = 1; i < 4; i++) {
      if (list[list.length - i].drive_mode == 0) {
        checkMode++;
      }
    }
    if (checkMode == 3 && list[list.length - 4].drive_mode != 0) {
      await this.sendNotification('start_other_operations', schemaName, data.route_id);
    }
  }

  async completeRoute(schemaName, routeHash, sectionName, sectionNames, routeId) {
    if (sectionNames.length < 1) {
      return false;
    }

    const checkFinishSegement = await this.CompleteRouteEntity.findBy({
      route_hash: routeHash,
      section_name: sectionName,
      schema_name: schemaName,
    });
    if (checkFinishSegement.length < 1) {
      await this.CompleteRouteEntity.save({
        route_hash: routeHash,
        section_name: sectionName,
        schema_name: schemaName,
      });
    }
    const routeHashSections = await this.CompleteRouteEntity.findBy({
      route_hash: routeHash,
      schema_name: schemaName,
    });
    const resultSegment = routeHashSections.map((a) => a.section_name);
    let checkSend = true;
    for (const element of sectionNames) {
      if (!resultSegment.includes(element)) {
        checkSend = false;
        break;
      }
    }

    if (checkSend) {
      await this.sendNotification('complete_route', schemaName, routeId);
    }
  }

  async sendNotification(type, schema, routeId) {
    const input = {
      type: type,
      schema: schema,
      route_id: routeId
    };
    console.log(input);
    this.logger.warn(`sendNotification : ${input})`);
    await this.send(input);
  }

  @Cron('*/5 * * * * *')
  async handleCron() {
    const formatDate = moment().format("YYYYMMDD");
    const tenants = await this.TenantEntity.find();
    const schemaNames = tenants.map((a) => a.schema);
    for (const schemaName of schemaNames) {
      if (schemaName == null) {
        continue;
      }
      const listRouteIdHashStartWorking = await this.getRouteIdHashStartWorkingByDay(schemaName);
      if (listRouteIdHashStartWorking.length < 1) {
        continue;
      }

      await this.handleDriverMode7OfCron(schemaName, listRouteIdHashStartWorking, formatDate);
      await this.handleDriverMode8OfCron(schemaName, listRouteIdHashStartWorking, formatDate);
    }
    await this.disconnectConsumerById();
  }

  async handleDriverMode8OfCron(schema, listRouteIdHashStartWorking, formatDate) {
    for (const routeIdHash of listRouteIdHashStartWorking) {
      let routeId = routeIdHash.replace(formatDate+"-", "");
      let edgeServe = await this.getEdgeServeByRoutId(schema, routeId);
      if (!edgeServe) {
        return;
      }
      const timestamp = new Date().getTime();
      const timeDate = new Date(timestamp - (edgeServe['operation_metrics'] * 10 * 1000));
      const listRouteIdHashRabbits = await this.getRouteIdHashRabbitBySchema(schema, timeDate);
      if (listRouteIdHashRabbits.includes(routeIdHash)) {
        return;
      }
      await this.sendNotification('end_operate', schema.toLowerCase(), routeId);
    }
  }

  async handleDriverMode7OfCron(schema, listRouteIdHashStartWorking, formatDate) {
    for (const routeIdHash of listRouteIdHashStartWorking) {
      let routeId = routeIdHash.replace(formatDate+"-", "");
      let edgeServe = await this.getEdgeServeByRoutId(schema, routeId);
      if (!edgeServe) {
        return;
      }
      const timestamp = new Date().getTime();
      const timeDate = new Date(timestamp - (edgeServe['operation_metrics'] * 3 * 1000));
      const listRouteIdHashRabbits = await this.getRouteIdHashRabbitBySchema(schema, timeDate);
      if (listRouteIdHashRabbits.includes(routeIdHash)) {
        return;
      }
      await this.sendNotification('lost_signal', schema.toLowerCase(), routeId);
    }
  }

  async handleRabbitDriveMode7And8(schemaName, data, routeIdHash, timeEdgeServe) {
    const checkStartWork = await this.CompleteRouteEntity.findBy({
      route_hash: routeIdHash,
      section_name: 'start_working',
      schema_name: schemaName,
    });
    if (checkStartWork.length < 1) {
      return;
    }
    const timestamp = new Date().getTime() - (timeEdgeServe * 11 * 1000);
    const timeDate = new Date(timestamp);
    const list = await this.getDataRabbitByTime(schemaName, routeIdHash, timeDate);
    if (list.length < 2) {
      return await this.sendNotification('start_operate', schemaName.toLowerCase(), data.route_id);
    }
    return await this.sendNotification('reconnect_signal', schemaName.toLowerCase(), data.route_id);
  }

  async getDataRabbitByTime(schemaName, routeIdHash, timestamp) {
    const data = [];
    try {
      await this.client.declareSuperStreamConsumer(
        { superStream: schemaName, offset: rabbit.Offset.timestamp(timestamp) },
        (message) => {
          if (message.messageProperties.messageId == routeIdHash) {
            data.push(JSON.parse(message.content.toString()));
          }
        },
      );
      await this.sleep(600);
      return data;
    } catch (e) {
      return [];
    }
  }

  async disconnectConsumerById() {
    const consumers = await this.client.getConsumers();
    for (const consumer of consumers) {
      if (consumer.consumer.consumerRef.includes('-')) {
        const extendedId = consumer.consumer.extendedId;
        try {
          await this.client.closeConsumer(extendedId);
        } catch (e) {}
      }
    }
  }

  async getRouteIdHashRabbitBySchema(schemaName, timestamp) {
    const data = [];
    try {
      await this.client.declareSuperStreamConsumer(
        { superStream: schemaName, offset: rabbit.Offset.timestamp(timestamp) },
        (message) => {
          data.push(message.messageProperties.messageId);
        },
      );
      await this.sleep(600);
      return data;
    } catch (e) {
      return [];
    }
  }

  async send(data) {
    const start = moment().format('YYYY-MM-DD 00:00:00');
    const end = moment().format('YYYY-MM-DD 23:59:59');
    const schema = data.schema.toLowerCase();
    const AppDataSource = new DataSource({
      type: process.env.DATABASE_TYPE as any,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      schema: schema,
      entities: [
        NotificationEntity,
        UserEntity,
        StaffEntity,
        SettingNotificationEntity,
        ComboBoxEntity,
        VehicleEntity,
        WorkingScheduleEntity,
        AbsenceVehicleEntity,
        RouteEntity,
        AbsenceStaffEntity,
        SectionEntity,
        SegmentEntity,
        SegmentRouteMapEntity,
        CoreSectionEntity,
      ],
      synchronize: true,
    });
    await AppDataSource.initialize();

    const working = await AppDataSource.manager
        .createQueryBuilder(WorkingScheduleEntity, 'ws')
        .innerJoinAndSelect('ws.vehicle', 'vehicle')
        .innerJoinAndSelect('ws.route', 'route')
        .where(`ws.route_id = :routeId`, { routeId: data.route_id })
        .andWhere(`ws.working_date = :startDate`, { startDate: `${start}` })
        .getOne();
    if (!working) {
      return false;
    }
    data.vehicle_id = working.vehicle.vehicle_number;
    data.route_name = working.route.name;

    const SIGNAL = [
      'lost_signal',
      'end_operate',
      'back_to_parking',
      'to_trash_collection_point',
      'to_landfill',
      'start_operate',
      'reconnect_signal',
    ];
    if (SIGNAL.includes(data.type)) {
      const latestNoti = await AppDataSource.manager
        .createQueryBuilder(NotificationEntity, 'noti')
        .where('noti.route_name = :routeName', { routeName: `${data.route_name}` })
        .orderBy('noti.id', 'DESC')
        .getOne();
      if (latestNoti) {
        if (latestNoti.type == data.type) {
          return false;
        }
        if (data.type == 'lost_signal' && latestNoti.type == 'end_operate') {
          return false;
        }
      }
    }

    if (data.type == 'to_trash_collection_point') {
      const checkFirst = await AppDataSource.manager
          .createQueryBuilder(NotificationEntity, 'noti')
          .where('noti.created_at >= :startDate', { startDate: `${start}` })
          .andWhere('noti.created_at <= :endDate', { endDate: `${end}` })
          .andWhere('noti.type = :type', { type: data.type })
          .andWhere('noti.route_name = :routeName', { routeName: `${data.route_name}` })
          .getOne();
      if (checkFirst) {
        return false;
      }
    }
    if (data.type == 'complete_route') {
      const checkCompleteRoute = await AppDataSource.manager
        .createQueryBuilder(NotificationEntity, 'noti')
        .where('noti.created_at >= :startDate', { startDate: `${start}` })
        .andWhere('noti.created_at <= :endDate', { endDate: `${end}` })
        .andWhere('noti.type = :type', { type: data.type })
        .andWhere('noti.route_name = :routeName', { routeName: `${data.route_name}` })
        .getOne();
      if (checkCompleteRoute) {
        return false;
      }
    }

    const users = await AppDataSource.manager.find(UserEntity, {
      where: { role: In(['OP', 'USER']) },
    });
    const current = formatISO(new Date());
    const noti = {
      route_name: data.route_name,
      vehicle_number: data.vehicle_id,
      type: data.type,
      createdAt: current,
      updatedAt: current,
      deletedAt: null,
      read_at: null,
      user_ids: [],
      id_ids: [],
    };
    for (let index = 0; index < users.length; index++) {
      const user = users[index];
      const condition = {};
      condition[data.type] = true;
      condition['user_id'] = user.master_id;
      const allow = await AppDataSource.manager.findOne(
        SettingNotificationEntity,
        { where: condition },
      );
      if (allow) {
        let input;
        input = data;
        input.vehicle_number = input.vehicle_id;
        input.createdAt = current;
        input.updatedAt = current;

        const entity = AppDataSource.manager.create(NotificationEntity, input);
        entity.user_id = user.master_id;
        const row = await AppDataSource.manager.save(entity);
        noti.user_ids.push(row.user_id);
        noti.id_ids.push(row.id);
      }
    }

    if (noti.user_ids.length) {
      this.eventEmitter.emit('sse.event', noti);
    }

    return true;
  }

  async startWorkingOfDispatchNo(routeIdHash, schemaName) {
    const checkStartWork = await this.CompleteRouteEntity.findBy({
      route_hash: routeIdHash,
      section_name: 'start_working',
      schema_name: schemaName,
    });
    if (checkStartWork.length < 1) {
      await this.CompleteRouteEntity.save({
        route_hash: routeIdHash,
        section_name: 'start_working',
        schema_name: schemaName,
      });
    }
  }

  async getRouteIdHashStartWorkingByDay(schemaName) {
    const start = moment().format('YYYY-MM-DD 00:00:00');
    const end = moment().format('YYYY-MM-DD 23:59:59');
    const listRouteIdHash = await this.CompleteRouteEntity.createQueryBuilder('cr')
      .where('cr.created_at >= :startDate', { startDate: `${start}` })
      .andWhere('cr.created_at <= :endDate', { endDate: `${end}` })
      .andWhere('cr.section_name = :sectionName', {sectionName: 'start_working'})
      .andWhere('cr.schema_name = :schemaName', {schemaName: schemaName})
      .getMany();

    return listRouteIdHash.map((a) => a.route_hash);
  }

  async getRouteById(schema: string, routeId: number) {
    const AppDataSource = new DataSource({
      type: process.env.DATABASE_TYPE as any,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      schema: schema,
      entities: [
        RouteEntity,
        SectionEntity,
        SegmentEntity,
        SegmentRouteMapEntity,
        CoreSectionEntity,
      ],
      synchronize: true,
    });
    await AppDataSource.initialize();
    return await AppDataSource.manager.findOne(RouteEntity, {
      where: { id: routeId },
      relations: ['sections', 'segment_routes.segment', 'cores'],
    });
  }

  getSegmentNameByType(segmentRoutes: SegmentRouteMapEntity[], cores, type) {
    let segmentId = null;
    let segmentName = null;
    for (const core of cores) {
      if (core.type == type) {
        segmentId = core.segment_id;
        break;
      }
    }
    for (const segmentRoute of segmentRoutes) {
      if (segmentRoute.segment_id == segmentId) {
        return (segmentName = segmentRoute.segment.name);
      }
    }

    return null;
  }

  async getEdgeServeByRoutId(schema: string, routeId: number) {
    const formatDate = moment().format('YYYY-MM-DD 00:00:00');
    const AppDataSource = new DataSource({
      type: process.env.DATABASE_TYPE as any,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      schema: schema,
      entities: [
        NotificationEntity,
        UserEntity,
        StaffEntity,
        SettingNotificationEntity,
        ComboBoxEntity,
        VehicleEntity,
        WorkingScheduleEntity,
        AbsenceVehicleEntity,
        RouteEntity,
        AbsenceStaffEntity,
        SectionEntity,
        SegmentEntity,
        SegmentRouteMapEntity,
        CoreSectionEntity,
        EdgeServeEntity
      ],
      synchronize: true,
    });
    await AppDataSource.initialize();
    const ws = await AppDataSource.manager
        .createQueryBuilder(WorkingScheduleEntity, 'ws')
        .where(`ws.route_id = :routeId`, { routeId: routeId })
        .andWhere(`ws.working_date = :workingDate`, { workingDate: formatDate })
        .getOne();

    if (!ws) {
      return false;
    }

    return await AppDataSource.manager
        .createQueryBuilder(EdgeServeEntity, 'es')
        .where(`es.vehicle_id = :vehicleId`, { vehicleId: ws.vehicle_id })
        .getOne();
  }
}
