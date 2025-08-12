import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AuthEdgeManagementDto,
  AuthEdgeManagementDtoRes,
} from './dto/auth-edge-management.dto';
import { DataSource, EntityTarget, In } from 'typeorm';
import {
  DispatchConfirmDtoReq,
  DispatchConfirmDtoRes,
} from './dto/dispatch-confirm.dto';
import { EdgeServeEntity } from 'libs/entities/edge-serve.entity';
import { VehicleInfoDtoReq } from './dto/vehicle-info.dto';
import { RouteInfoDtoReq } from './dto/route-info.dto';
import { CoreSectionDtoReq } from './dto/core-section.dto';
import { EdgeInfoReq } from './dto/edge-info.dto';
import { EdgeSettingDtoReq, EdgeSettingDtoRes } from './dto/edge-setting.dto';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import { ComboBoxEntity } from 'libs/entities/combo-box.entity';
import { StaffEntity } from 'libs/entities/staff.entity';
import { UserEntity } from 'libs/entities/user.entity';
import { SettingNotificationEntity } from 'libs/entities/setting-notification.entity';
import { NotificationEntity } from 'libs/entities/notification.entity';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import { SegmentInfoDtoReq } from './dto/segment-info.dto';
import { AbsenceStaffEntity } from 'libs/entities/absence-staff.entity';
import { AbsenceVehicleEntity } from 'libs/entities/absence-vehicle.entity';
import { RouteEntity } from 'libs/entities/route.entity';
import { SegmentEntity } from 'libs/entities/segment.entity';
import { SectionEntity } from 'libs/entities/section.entity';
import { SegmentRouteMapEntity } from 'libs/entities/segment-route-map.entity';
import { CoreSectionEntity } from 'libs/entities/core-section.entity';
import { GuideEntity } from 'libs/entities/guide.entity';
import { CongestionCodeEntity } from 'libs/entities/congestion-code.entity';
import { GuideCodeEntity } from 'libs/entities/guide-code.entity';
import { StorageDataEntity } from 'libs/entities/storage-data.entity';
import { PointEntity } from 'libs/entities/point.entity';
import { LogoEntity } from 'libs/entities/logo.entity';
import { MetadataEntity } from 'libs/entities/metadata.entity';
import { SignatureEntity } from 'libs/entities/signature.entity';
import { DrivingRecordEntity } from 'libs/entities/driving-record.entity';
import { LandfillRecordEntity } from 'libs/entities/landfill-record.entity';
import { SignHistoryEntity } from 'libs/entities/sign-history.entity';
import { ConfigWeightEntity } from 'libs/entities/config-weight.entity';
import * as dayjs from 'dayjs';
import * as moment from 'moment';
import {
  EdgeState1HourEntity,
  EdgeStateRawEntity,
} from 'libs/entities/edge-state.entity';
import { RouteSegmentMapInfoDtoReq } from './dto/route-segment-map-info.dto';
import { CongestionCodeInfoDtoReq } from './dto/congestion-code-info.dto';
import { GuideCodeInfoDtoReq } from './dto/guide-code-info.dto';

@Injectable()
export class EdgeManagementService {
  constructor(private dataSource: DataSource) {}

  remove(id: number) {
    return `This action removes a #${id} edgeManagement`;
  }

  async auth({
    data: { edge_id, mac_address, password },
    customer_id,
  }: AuthEdgeManagementDto): Promise<AuthEdgeManagementDtoRes> {
    const schema = await this.customerProxy(customer_id);
    const edgeRepositoryTest = await this.fetchFromDynamicSchema(
      schema,
      EdgeServeEntity,
    );
    const edgeServe = await edgeRepositoryTest.findOne({
      where: {
        edge_name: edge_id,
        password,
        mac_address,
      },
      relations: ['vehicle'],
    });

    if (!edgeServe) {
      return {
        topic: 'edge_login_RES',
        customer_id,
        status: 'failure',
        data: {
          message:
            '로그인에 오류가 발생했습니다./n 로그인 정보를 확인해 주세요.',
        },
      };
    }

    return {
      topic: 'edge_login_RES',
      customer_id,
      status: 'success',
      data: {
        edge_id: edgeServe.edge_name,
        vehicle_id: edgeServe.vehicle.vehicle_number,
      },
    };
  }

  async dispatchConfirm(
    dispatchConfirmDtoReq: DispatchConfirmDtoReq,
  ): Promise<DispatchConfirmDtoRes> {
    const schema = await this.customerProxy(dispatchConfirmDtoReq.customer_id);
    const workingScheduleRepo = await this.fetchFromDynamicSchema(
      schema,
      WorkingScheduleEntity,
    );
    const workingSchedule = await workingScheduleRepo.findOne({
      where: {
        vehicle: {
          vehicle_number: dispatchConfirmDtoReq.data.vehicle_id,
        },
        working_date: dayjs(new Date(dispatchConfirmDtoReq.data.date))
          .startOf('day')
          .toDate(),
      },
      relations: {
        route: true,
        wsDriver: true,
        wsBackupDriver: true,
        wsFieldAgent1: true,
        wsFieldAgent2: true,
        wsBackupFieldAgent1: true,
        wsBackupFieldAgent2: true,
      },
      order: {
        createdAt: 'desc',
      },
    });
    if (workingSchedule) {
      return {
        customer_id: dispatchConfirmDtoReq.customer_id ?? 'n/a',
        topic: 'dispatch_confirm_RES',
        status: 'success',
        data: {
          // dispatch_no: workingSchedule?.dispatch_no ?? 'n/a',
          date: moment(dispatchConfirmDtoReq.data.date).format('YYYY-MM-DD'),
          route_type: workingSchedule?.purpose,
          route_id: workingSchedule?.route?.id,
          route_name: workingSchedule?.route?.name
            ? workingSchedule?.route?.name?.toString()
            : 'n/a',
          vehicle_id: dispatchConfirmDtoReq.data.vehicle_id,
          driver_name: workingSchedule?.wsDriver?.name ?? 'n/a',
          crew1_name: workingSchedule?.wsFieldAgent1?.name ?? 'n/a',
          crew2_name: workingSchedule?.wsFieldAgent2?.name ?? 'n/a',
          alt_driver_name: workingSchedule?.wsBackupDriver?.name ?? 'n/a',
          alt_crew1_name: workingSchedule?.wsBackupFieldAgent1?.name ?? 'n/a',
          alt_crew2_name: workingSchedule?.wsBackupFieldAgent2?.name ?? 'n/a',
        },
      };
    }
    return {
      customer_id: dispatchConfirmDtoReq.customer_id,
      topic: 'dispatch_confirm_RES',
      status: 'failure',
      data: {
        message: '배차 정보 수신에 오류가 발생했습니다.',
      },
    };
  }

  async edgeSetting(edgeSettingDtoReq: EdgeSettingDtoReq) {
    const schema = await this.customerProxy(edgeSettingDtoReq.customer_id);
    const edgeRepositoryTest = await this.fetchFromDynamicSchema(
      schema,
      EdgeServeEntity,
    );
    const configWeightEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      ConfigWeightEntity,
    );
    const vehicle = await edgeRepositoryTest.findOne({
      where: {
        edge_name: edgeSettingDtoReq.data.edge_id,
      },
      relations: ['vehicle'],
    });
    const version = parseFloat(edgeSettingDtoReq.version);
    if (!vehicle) {
      return {
        customer_id: edgeSettingDtoReq?.customer_id,
        topic: 'edge_setting_RES',
        version,
        status: 'failure',
        data: {
          message: '엣지 설정 정보 수신에 오류가 발생했습니다.',
        },
      };
    }
    const currentVersion = parseFloat(vehicle?.edge_setting_version.toString());
    const workingScheduleRepo = await this.fetchFromDynamicSchema(
      schema,
      WorkingScheduleEntity,
    );
    await workingScheduleRepo.update(
      {
        vehicle_id: vehicle.vehicle?.id,
        working_date: moment().format('YYYY-MM-DD 00:00:00') as any,
      },
      {
        operation_metrics: vehicle.operation_metrics,
      },
    );
    if (version < currentVersion) {
      const weight = await configWeightEntityRepository.find({
        skip: 0,
        take: 1,
        order: { createdAt: 'DESC' },
      });
      let avgWeight = {};
      if (weight.length) {
        const firstWeight = weight[0];
        avgWeight = {
          '5L_gen': +firstWeight['5L_gen'],
          '10L_gen': +firstWeight['10L_gen'],
          '10L_reu': +firstWeight['10L_reu'],
          '20L_gen': +firstWeight['20L_gen'],
          '20L_reu': +firstWeight['20L_reu'],
          '30L_gen': +firstWeight['30L_gen'],
          '50L_gen': +firstWeight['50L_gen'],
          '50L_pub': +firstWeight['50L_pub'],
          '75L_gen': +firstWeight['75L_gen'],
          '75L_pub': +firstWeight['75L_pub'],
          ext: +firstWeight.ext,
          etc: +firstWeight.etc,
        };
      }
      return {
        customer_id: edgeSettingDtoReq?.customer_id,
        topic: 'edge_setting_RES',
        version: currentVersion,
        status: 'success',
        data: {
          system_setting: {
            // version: vehicle?.edge_setting_version?.toString() ?? '',
            drive_metrics_interval: vehicle?.operation_metrics as any,
            collect_metrics_interval: vehicle?.collection_metrics as any,
            edge_state_interval: vehicle?.edge_metrics as any,
            drive_stat_ui: vehicle?.operation_status_ui ? 'yes' : 'no',
            collect_stat_ui: vehicle?.collection_status_ui ? 'yes' : 'no',
            count_stat_ui: vehicle?.quantity_analysis_ui ? 'yes' : 'no',
            volume_stat_ui: vehicle?.volume_analysis_ui ? 'yes' : 'no',
            video_ui: vehicle?.video_ui ? 'yes' : 'no',
            avg_weight: avgWeight,
          },
          user_notice: {
            no_destination: '저장된 목적지 주소가 없습니다.',
            no_selection:
              '안전운행 모드를 시작합니다./n이후 운행모드를 선택하시려면 화면 상단의 운행모드 버튼을 눌러주세요.',
            p2p_start: '경로 안내를 시작합니다.',
            p2p_goal: '목적지에 도착했습니다./n경로 안내를 종료합니다.',
            p2p_off_path: '경로를 이탈했습니다./n대안 경로 안내합니다.',
            p2p_continue: '이전 경로가 존재합니다./n이어서 운행 하시겠습니까?',
            p2p_section_pointIndex:
              '{name} 구간에 진입했습니다./n구간 거리는 {distance} 미터입니다.',
            p2p_guide_pointIndex:
              '{distance} 미터 전방에서 {instructions} 입니다.',
            p2p_guide_pointIndex_goal: '잠시 후 목적지에 도착합니다.',
            collect_start:
              '수거지에 진입했습니다./n수거경로 안내를 시작합니다.',
            collect_goal:
              '목적지에 도착했습니다./n금일 수거경로 안내를 종료합니다.',
            collect_off_path:
              '경로를 이탈했습니다./n이전 지점으로 복귀경로를 안내합니다.',
            collect_on_path:
              '수거경로에 재진입했습니다./n수거경로 안내를 다시 시작합니다.',
            collect_to_landfill: '매립지로 이동하시겠습니까?',
            collect_continue:
              '이전 수거경로가 존재합니다./n이어서 운행 하시겠습니까?',
            collect_section_pointIndex:
              '{name} 구간에 진입했습니다./n구간 거리는 {distance} 미터입니다.',
            collect_guide_pointIndex:
              '{distance} 미터 전방에서 {instructions} 입니다.',
            collect_guide_pointCount: '잠시 후 {instructions} 입니다.',
          },
        },
      } as EdgeSettingDtoRes;
    } else {
      return {
        customer_id: edgeSettingDtoReq?.customer_id,
        topic: 'edge_setting_RES',
        version: currentVersion,
        status: 'up_to_date',
        data: {
          message: '현재 엣지 설정 정보는최신입니다',
        },
      };
    }
  }

  async vehicleInfo(vehicleInfoDtoReq: VehicleInfoDtoReq) {
    const schema = await this.customerProxy(vehicleInfoDtoReq.customer_id);
    const vehicleRepository = await this.fetchFromDynamicSchema(
      schema,
      VehicleEntity,
    );
    const vehicle = await vehicleRepository.findOne({
      where: {
        vehicle_number: vehicleInfoDtoReq.data.vehicle_id as any,
      },
      relations: {
        vehicle_type: true,
        vehicle_model: true,
        manufacturer: true,
        capacity: true,
        max_capacity: true,
        special_features: true,
        absence: true,
        wsVehicle: true,
      },
    });
    const version = parseFloat(vehicleInfoDtoReq.version);
    if (!vehicle) {
      return {
        customer_id: vehicleInfoDtoReq.customer_id,
        topic: 'vehicle_info_RES',
        version,
        status: 'failure',
        data: {
          message: '차량 정보 수신에 오류가 발생했습니다.',
        },
      };
    }
    const edgeRepository = await this.fetchFromDynamicSchema(
      schema,
      EdgeServeEntity,
    );
    const edgeSetting = await edgeRepository.findOne({
      where: {
        vehicle: {
          id: vehicle.id,
        },
      },
      relations: ['vehicle'],
    });
    if (!edgeSetting) {
      return {
        customer_id: vehicleInfoDtoReq.customer_id,
        topic: 'vehicle_info_RES',
        version: edgeSetting.edge_setting_version,
        status: 'failure',
        data: {
          message: '차량 정보 수신에 오류가 발생했습니다.',
        },
      };
    }
    if (version < edgeSetting.edge_setting_version) {
      const comboBoxRepositoryTest = await this.fetchFromDynamicSchema(
        schema,
        ComboBoxEntity,
      );
      let vehicleType = null;
      if (vehicle?.vehicle_type?.id) {
        const { entities, raw } = await comboBoxRepositoryTest
          .createQueryBuilder('cb')
          .addSelect(
            `pgp_sym_decrypt(cb.data::bytea,'${process.env.ENCRYPT_KEY}')`,
            'data',
          )
          .where(`cb.id = ${vehicle?.vehicle_type?.id}`)
          .getRawAndEntities();
        const entity = entities[0];
        entity.data = raw[0].data;
        vehicleType = entity;
      }
      let vehicleModel = null;
      if (vehicle?.vehicle_model?.id) {
        const { entities, raw } = await comboBoxRepositoryTest
          .createQueryBuilder('cb')
          .addSelect(
            `pgp_sym_decrypt(cb.data::bytea,'${process.env.ENCRYPT_KEY}')`,
            'data',
          )
          .where(`cb.id = ${vehicle?.vehicle_model.id}`)
          .getRawAndEntities();
        const entity = entities[0];
        entity.data = raw[0].data;
        vehicleModel = entity;
      }
      let vehicleManufacturer = null;
      if (vehicle?.manufacturer?.id) {
        const { entities, raw } = await comboBoxRepositoryTest
          .createQueryBuilder('cb')
          .addSelect(
            `pgp_sym_decrypt(cb.data::bytea,'${process.env.ENCRYPT_KEY}')`,
            'data',
          )
          .where(`cb.id = ${vehicle?.manufacturer.id}`)
          .getRawAndEntities();
        const entity = entities[0];
        entity.data = raw[0].data;
        vehicleManufacturer = entity;
      }
      let vehicleCapacityM3 = null;
      if (vehicle?.capacity?.id) {
        const { entities, raw } = await comboBoxRepositoryTest
          .createQueryBuilder('cb')
          .addSelect(
            `pgp_sym_decrypt(cb.data::bytea,'${process.env.ENCRYPT_KEY}')`,
            'data',
          )
          .where(`cb.id = ${vehicle?.capacity?.id}`)
          .getRawAndEntities();
        const entity = entities[0];
        entity.data = raw[0].data;
        vehicleCapacityM3 = entity;
      }
      let vehicleCapacityKg = null;
      if (vehicle?.max_capacity?.id) {
        const { entities, raw } = await comboBoxRepositoryTest
          .createQueryBuilder('cb')
          .addSelect(
            `pgp_sym_decrypt(cb.data::bytea,'${process.env.ENCRYPT_KEY}')`,
            'data',
          )
          .where(`cb.id = ${vehicle?.max_capacity.id}`)
          .getRawAndEntities();
        const entity = entities[0];
        entity.data = raw[0].data;
        vehicleCapacityKg = entity;
      }
      let vehicleNote = null;
      if (vehicle?.special_features?.id) {
        const { entities, raw } = await comboBoxRepositoryTest
          .createQueryBuilder('cb')
          .addSelect(
            `pgp_sym_decrypt(cb.data::bytea,'${process.env.ENCRYPT_KEY}')`,
            'data',
          )
          .where(`cb.id = ${vehicle?.special_features?.id}`)
          .getRawAndEntities();
        const entity = entities[0];
        entity.data = raw[0].data;
        vehicleNote = entity;
      }
      return {
        customer_id: vehicleInfoDtoReq.customer_id,
        topic: 'vehicle_info_RES',
        // version: edgeSetting.edge_setting_version,
        version: edgeSetting?.edge_setting_version?.toString() ?? 'n/a',
        status: 'success',
        data: {
          vehicle_id: vehicle?.vehicle_number ?? 'n/a',
          type: (vehicleType && vehicleType?.data) ?? 'n/a',
          model: (vehicleModel && vehicleModel?.data) ?? 'n/a',
          vendor: (vehicleManufacturer && vehicleManufacturer.data) ?? 'n/a',
          capacity_m3:
            vehicleCapacityM3 &&
            (parseInt(vehicleCapacityM3?.data) ?? ('n/a' as any)),
          capacity_kg:
            vehicleCapacityKg &&
            (parseInt(vehicleCapacityKg.data) ?? ('n/a' as any)),
          operation_start: vehicle?.operation_start_date
            ? dayjs(vehicle.operation_start_date).format('YYYY-MM-DD')
            : 'n/a',
          operation_end: vehicle?.operation_end_date
            ? dayjs(vehicle.operation_end_date).format('YYYY-MM-DD')
            : 'n/a',
          dispatch_status: vehicle.status ?? 'n/a',
          last_maintenance: vehicle?.recent_maintenance
            ? dayjs(vehicle.recent_maintenance).format('YYYY-MM-DD')
            : 'n/a',
          usage: vehicle?.purpose ?? 'n/a',
          next_maintenance: vehicle?.next_maintenance
            ? dayjs(vehicle.next_maintenance).format('YYYY-MM-DD')
            : 'n/a',
          note: vehicle.note ?? 'n/a',
        },
      } as any;
    } else {
      return {
        customer_id: vehicleInfoDtoReq.customer_id,
        topic: 'vehicle_info_RES',
        version: edgeSetting.edge_setting_version,
        status: 'up_to_date',
        data: {
          message: '현재 차량 정보는 최신입니다.',
        },
      };
    }
  }

  async routeInfo(routeInfoDtoReq: RouteInfoDtoReq) {
    const schema = await this.customerProxy(routeInfoDtoReq.customer_id);
    const routeEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      RouteEntity,
    );
    const workingScheduleEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      WorkingScheduleEntity,
    );
    const edgeServeEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      EdgeServeEntity,
    );
    const guideEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      GuideEntity,
    );
    const currentWorking = await workingScheduleEntityRepository.findOne({
      where: {
        route: {
          id: routeInfoDtoReq.data.route_id,
        },
        working_date: dayjs(new Date()).startOf('day').toDate(),
      },
      relations: {
        route: true,
        vehicle: true,
      },
    });
    console.log('currentWorking', currentWorking);
    const version = parseFloat(routeInfoDtoReq.version);
    if (!currentWorking) {
      return {
        customer_id: routeInfoDtoReq.customer_id,
        topic: 'route_info_RES',
        status: 'failure',
        version,
        data: {
          message: '경로 정보 수신에 오류가 발생했습니다.',
        },
      };
    }
    const edgeServe = await edgeServeEntityRepository.findOne({
      where: {
        vehicle: {
          id: currentWorking.vehicle.id,
        },
      },
      relations: {
        vehicle: true,
      },
    });
    if (!edgeServe) {
      return {
        customer_id: routeInfoDtoReq.customer_id,
        topic: 'route_info_RES',
        status: 'failure',
        version,
        data: {
          message: '경로 정보 수신에 오류가 발생했습니다.',
        },
      };
    }
    if (version < edgeServe.edge_setting_version) {
      const found = await routeEntityRepository.findOne({
        where: {
          id: routeInfoDtoReq.data.route_id,
        },
        relations: {
          sections: true,
          cores: true,
          segment_routes: true,
        },
      });
      const guide = await guideEntityRepository.find({
        where: {
          route_id: routeInfoDtoReq.data.route_id,
        },
      });
      if (found) {
        return {
          customer_id: routeInfoDtoReq.customer_id,
          topic: 'route_info_RES',
          version: edgeServe.edge_setting_version,
          status: 'success',
          data: {
            summary: {
              type: found.type,
              name: found.name,
              start: found?.start?.coordinates ?? 'n/a',
              goal: found?.goal?.coordinates ?? 'n/a',
              distance: found?.distance ?? 'n/a',
              duration: found?.duration ?? 'n/a',
              bbox: found?.bbox?.coordinates[0] ?? 'n/a',
              collect_count: found?.collect_count ?? 'n/a',
              collect_volume: found?.collect_volume ?? 'n/a',
            },
            path: found?.path?.coordinates,
            section: found?.sections
              ? found?.sections.map((s) => ({
                  pointIndex: s?.point_index ?? 'n/a',
                  pointCount: s?.point_count ?? 'n/a',
                  distance: s?.distance ?? 'n/a',
                  name: s?.name ?? 'n/a',
                  // id: s.id,
                  collect_volume: s?.collect_volume ?? 'n/a',
                  duration: s?.duration ?? 'n/a',
                  congestion: s?.congestion ?? 'n/a',
                  collect_count: s?.collect_count ?? 'n/a',
                }))
              : 'n/a',
            guide: guide?.length
              ? guide.map((g) => ({
                  pointIndex: g?.point_index ?? 'n/a',
                  pointCount: g.point_count,
                  type: g?.type ?? 'n/a',
                  instructions: g?.instructions ?? 'n/a',
                  distance: g?.distance ?? 'n/a',
                  duration: g?.duration ?? 'n/a',
                  bbox: g?.bbox?.coordinates[0] ?? 'n/a',
                }))
              : 'n/a',
          },
        };
      }
    } else {
      return {
        customer_id: routeInfoDtoReq.customer_id,
        topic: 'route_info_RES',
        status: 'up_to_date',
        version: edgeServe.edge_setting_version,
        data: {
          message: '현재 경로 정보는 최신입니다.',
        },
      };
    }
  }

  async segmentInfo(segmentInfoDtoReq: SegmentInfoDtoReq) {
  const schema = await this.customerProxy(segmentInfoDtoReq.customer_id);
  const sectionEntityRepository = await this.fetchFromDynamicSchema(
    schema,
    SegmentEntity,
  );
  const workingScheduleEntityRepository = await this.fetchFromDynamicSchema(
    schema,
    WorkingScheduleEntity,
  );
  const edgeServeEntityRepository = await this.fetchFromDynamicSchema(
    schema,
    EdgeServeEntity,
  );
  const coreSectionEntityRepository = await this.fetchFromDynamicSchema(
    schema,
    CoreSectionEntity,
  );

  const currentWorking = await workingScheduleEntityRepository.findOne({
    where: {
      route: {
        id: segmentInfoDtoReq.data.route_id,
      },
      working_date: dayjs(new Date()).startOf('day').toDate(),
    },
    relations: {
      route: true,
      vehicle: true,
    },
  });

  const version = parseFloat(segmentInfoDtoReq.version);

  if (!currentWorking) {
    return {
      customer_id: segmentInfoDtoReq.customer_id,
      topic: 'segment_info_RES',
      version,
      status: 'failure',
      data: {
        message: '세그먼트 정보 수신에 오류가 발생했습니다.',
      },
    };
  }

  const edgeServe = await edgeServeEntityRepository.findOne({
    where: {
      vehicle: {
        id: currentWorking.vehicle.id,
      },
    },
  });

  if (version < edgeServe.edge_setting_version) {
    let coreSection = await coreSectionEntityRepository.find({
      where: {
        route: {
          id: segmentInfoDtoReq.data.route_id,
        },
      },
      relations: {
        route: true,
      },
    });

    // Nếu không tìm thấy coreSection → fallback sang route_id = 0
    if (!coreSection.length) {
      coreSection = await coreSectionEntityRepository.find({
        where: {
          route_id: 0,
        },
      });
    } else {
      // Nếu tìm thấy coreSection thì kiểm tra các type cần thiết
      const findSegment = (type: string) =>
        coreSection.find((seg) => seg.type === type);

      const garage = findSegment('GARAGE');
      const entry = findSegment('ENTRY');
      const landfill = findSegment('LANDFILL');

      const missingTypes: string[] = [];
      if (!garage) missingTypes.push('GARAGE');
      if (!entry) missingTypes.push('ENTRY');
      if (!landfill) missingTypes.push('LANDFILL');

      if (missingTypes.length > 0) {
        const fallbackSections = await coreSectionEntityRepository.find({
          where: {
            route_id: 0,
          },
        });

        const fallbackToAdd = fallbackSections.filter((seg) =>
          missingTypes.includes(seg.type),
        );

        coreSection = [...coreSection, ...fallbackToAdd];
      }
    }

    // Lấy segment theo segment_routes
    const found = await sectionEntityRepository.find({
      where: {
        segment_routes: {
          route_id: segmentInfoDtoReq.data.route_id,
        },
      },
      relations: {
        segment_routes: true,
      },
    });

    // Nếu không tìm thấy gì trong segment_routes → fallback sang segment_id từ coreSection
    let segmentEntitiesFromCore: SegmentEntity[] = [];
    if (!found.length) {
      const segmentIdsFromCore = coreSection.map((c) => c.segment_id);
      segmentEntitiesFromCore = await sectionEntityRepository.find({
        where: {
          id: In(segmentIdsFromCore),
        },
      });
    } else {
      // Nếu có → dùng bình thường, vẫn có thể merge với coreSection nếu muốn
      const segmentIdsFromCore = coreSection.map((c) => c.segment_id);
      segmentEntitiesFromCore = await sectionEntityRepository.find({
        where: {
          id: In(segmentIdsFromCore),
        },
      });
    }

    // Gộp tránh trùng ID
    const mergedSegmentsMap = new Map<number, SegmentEntity>();

    segmentEntitiesFromCore.forEach((seg) => {
      if (seg?.id) mergedSegmentsMap.set(seg.id, seg);
    });

    found.forEach((seg) => {
      if (seg?.id && !mergedSegmentsMap.has(seg.id)) {
        mergedSegmentsMap.set(seg.id, seg);
      }
    });

    const mergedSegments = Array.from(mergedSegmentsMap.values());

    return {
      customer_id: segmentInfoDtoReq.customer_id,
      topic: 'segment_info_RES',
      version: edgeServe.edge_setting_version,
      status: 'success',
      data: mergedSegments.map((s) => ({
        id: s.id,
        segment_line: s.segment_line?.coordinates ?? 'n/a',
        distance: s.distance ?? 'n/a',
        name: s.name ?? 'n/a',
        congestion: s.congestion ?? 'n/a',
        duration: s.duration,
        must_pass: s.must_pass,
        manual_collect: s.manual_collect,
        collect_count: s.collect_count,
        collect_volume: s.collect_volume,
      })),
    };
  } else {
    return {
      customer_id: segmentInfoDtoReq.customer_id,
      topic: 'segment_info_RES',
      version: edgeServe.edge_setting_version,
      status: 'up_to_date',
      data: {
        message: '현재 세그먼트 정보는 최신입니다.',
      },
    };
  }
}


  async coreSectionInfo(coreSectionDtoReq: CoreSectionDtoReq) {
    const schema = await this.customerProxy(coreSectionDtoReq.customer_id);
    const coreSectionEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      CoreSectionEntity,
    );
    const workingScheduleEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      WorkingScheduleEntity,
    );
    const edgeServeEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      EdgeServeEntity,
    );

    let coreSection = await coreSectionEntityRepository.find({
      where: {
        route: {
          id: coreSectionDtoReq.data.route_id,
        },
      },
      relations: {
        route: true,
      },
    });
    const version = parseFloat(coreSectionDtoReq.version);
    const currentWorking = await workingScheduleEntityRepository.findOne({
      where: {
        route: {
          id: coreSectionDtoReq.data.route_id,
        },
        working_date: dayjs(new Date()).startOf('day').toDate(),
      },
      relations: {
        route: true,
        vehicle: true,
      },
    });
    const edgeServe = await edgeServeEntityRepository.findOne({
      where: {
        vehicle: {
          id: currentWorking.vehicle.id,
        },
      },
    });
    try {
      if (version < edgeServe.edge_setting_version) {
        if (coreSection.length) {
          const findSegment = (type: string) =>
            coreSection.find((seg) => seg.type === type);

          const garage = findSegment('GARAGE');
          const entry = findSegment('ENTRY');
          const landfill = findSegment('LANDFILL');

          const missingTypes: string[] = [];
          if (!garage) missingTypes.push('GARAGE');
          if (!entry) missingTypes.push('ENTRY');
          if (!landfill) missingTypes.push('LANDFILL');

          // Nếu thiếu segment nào đó thì lấy thêm từ route_id = 0
          if (missingTypes.length > 0) {
            const fallbackSections = await coreSectionEntityRepository.find({
              where: {
                route_id: 0, // Không dùng relations vì route id = 0 không tồn tại trong bảng route
              },
            });

            const fallbackToAdd = fallbackSections.filter((seg) =>
              missingTypes.includes(seg.type),
            );

            // Ghép thêm vào coreSection, giữ nguyên route_id (0 hoặc 1)
            coreSection = [...coreSection, ...fallbackToAdd];
          }

          return {
            customer_id: coreSectionDtoReq.customer_id,
            topic: 'core_section_info_RES',
            version: edgeServe.edge_setting_version,
            status: 'success',
            data: coreSection.map((c) => ({
              segment_id: c.segment_id,
              route_id: c.route?.id ?? c.route_id, // Lấy từ relation nếu có, không thì dùng route_id trực tiếp
              name: c.name,
              pointIndex: c.point_index,
              route_type: c.route_type,
              type: c.type,
            })),
          };
        } else {
          coreSection = await coreSectionEntityRepository.find({
            where: {
              route_id: 0, // Không dùng relations vì route id = 0 không tồn tại trong bảng route
            },
          });

          return {
            customer_id: coreSectionDtoReq.customer_id,
            topic: 'core_section_info_RES',
            version: edgeServe.edge_setting_version,
            status: 'success',
            data: coreSection.map((c) => ({
              segment_id: c.segment_id,
              route_id: c.route?.id ?? c.route_id, // Lấy từ relation nếu có, không thì dùng route_id trực tiếp
              name: c.name,
              pointIndex: c.point_index,
              route_type: c.route_type,
              type: c.type,
            })),
          };
        }
      } else {
        return {
          customer_id: coreSectionDtoReq.customer_id,
          topic: 'core_section_info_RES',
          status: 'up_to_date',
          version: edgeServe.edge_setting_version,
          data: {
            message: '현재 코어섹션 정보는 최신입니다.',
          },
        };
      }
    } catch (error) {
      console.log('error', error);

      return {
        customer_id: coreSectionDtoReq.customer_id,
        version,
        topic: 'core_section_info_RES',
        status: 'failure',
        data: {
          message: '코어섹션 정보 수신에 오류가 발생했습니다.',
        },
      };
    }
  }
  buildRouteInfoForCoreSection(type: string) {
    let result: string | number;
    switch (type) {
      case 'GARAGE': {
        result = 1;
        break;
      }
      case 'LANDFILL': {
        result = 2;
        break;
      }
      case 'ENTRY':
      default: {
        const randomNumber = Math.floor(Math.random() * 90) + 10;
        result = '0' + randomNumber;
      }
    }
    return result;
  }

  async edgeInfo(edgeInfoReq: EdgeInfoReq) {
    const schema = await this.customerProxy(edgeInfoReq.customer_id);
    const edgeRepository = await this.fetchFromDynamicSchema(
      schema,
      EdgeServeEntity,
    );
    const vehicle = await edgeRepository.findOne({
      where: {
        edge_name: edgeInfoReq.data.edge_id,
      },
      relations: ['vehicle'],
    });
    if (!vehicle) {
      return {
        customer_id: edgeInfoReq.customer_id,
        topic: edgeInfoReq.topic,
        status: 'failure',
        data: {
          message: '엣지 상태 정보 업데이트에 오류가 발생했습니다.',
        },
      };
    }
    await edgeRepository
      .createQueryBuilder()
      .update()
      .set({
        edge_setting_version: () => 'edge_setting_version + 0.01', // update version
      })
      .whereInIds([vehicle.id])
      .execute();
    await edgeRepository.update(
      {
        id: vehicle.id,
      },
      {
        hw_version: edgeInfoReq.data.hw_model ?? null,
        os_version: edgeInfoReq.data.os_ver ?? null,
        kernel_version: edgeInfoReq.data.kernel_ver ?? null,
        jetpack_version: edgeInfoReq.data.jetpack_ver ?? null,
        docker_version: edgeInfoReq.data.docker_ver ?? null,
      },
    );
    return {
      customer_id: edgeInfoReq.customer_id,
      topic: edgeInfoReq.topic,
      status: 'success',
      data: {
        message: '엣지 상태 정보가 업데이트 되었습니다.',
      },
    };
  }

  async customerProxy(customerId: string) {
    const schema = 'public';
    const query = `
            SELECT *
            FROM "${schema}".tenant
            WHERE (
                      schema = $1
                      )
        `;
    const tenant = await this.dataSource.query(query, [customerId]);
    if (!tenant.length) {
      return {
        customer_id: customerId,
        topic: 'dispatch_confirm_RES',
        data: {
          status: 'failure',
          message: '배차 정보 수신에 오류가 발생했습니다.',
        },
      };
    }
    return tenant[0].schema;
  }

  async fetchFromDynamicSchema<T>(schemaName: string, entity: EntityTarget<T>) {
    if (!schemaName) {
      throw new BadRequestException('schemaName can not be falsy');
    }
    const AppDataSource = new DataSource({
      type: process.env.DATABASE_TYPE as any,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      schema: schemaName,
      entities: [
        StaffEntity,
        VehicleEntity,
        UserEntity,
        ComboBoxEntity,
        SettingNotificationEntity,
        NotificationEntity,
        WorkingScheduleEntity,
        EdgeServeEntity,
        RouteEntity,
        SegmentEntity,
        SectionEntity,
        SegmentRouteMapEntity,
        CoreSectionEntity,
        GuideEntity,
        CongestionCodeEntity,
        GuideCodeEntity,
        StorageDataEntity,
        PointEntity,
        LogoEntity,
        MetadataEntity,
        AbsenceVehicleEntity,
        AbsenceStaffEntity,
        SignatureEntity,
        DrivingRecordEntity,
        LandfillRecordEntity,
        SignHistoryEntity,
        ConfigWeightEntity,
        EdgeStateRawEntity,
        EdgeState1HourEntity,
      ],
      synchronize: true,
    });
    const dataSource = await AppDataSource.initialize();
    return dataSource.manager.getRepository(entity);
  }

  async routeSegmentMapInfo(
    routeSegmentMapInfoDtoReq: RouteSegmentMapInfoDtoReq,
  ) {
    const schema = await this.customerProxy(
      routeSegmentMapInfoDtoReq.customer_id,
    );
    const segmentRouteMapRepository = await this.fetchFromDynamicSchema(
      schema,
      SegmentRouteMapEntity,
    );
    const workingScheduleEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      WorkingScheduleEntity,
    );
    const edgeServeEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      EdgeServeEntity,
    );
    const currentWorking = await workingScheduleEntityRepository.findOne({
      where: {
        route: {
          id: routeSegmentMapInfoDtoReq.data.route_id,
        },
        working_date: dayjs(new Date()).startOf('day').toDate(),
      },
      relations: {
        route: true,
        vehicle: true,
      },
    });
    const version = parseFloat(routeSegmentMapInfoDtoReq.version);
    if (!currentWorking) {
      return {
        customer_id: routeSegmentMapInfoDtoReq.customer_id,
        topic: 'route_segment_map_info_RES',
        status: 'failure',
        version,
        data: {
          message: '경로-세그먼트-맵 정보 수신에 오류가 발생했습니다.',
        },
      };
    }
    const edgeServe = await edgeServeEntityRepository.findOne({
      where: {
        vehicle: {
          id: currentWorking.vehicle.id,
        },
      },
      relations: {
        vehicle: true,
      },
    });
    if (!edgeServe) {
      return {
        customer_id: routeSegmentMapInfoDtoReq.customer_id,
        topic: 'route_segment_map_info_RES',
        status: 'failure',
        version,
        data: {
          message: '경로-세그먼트-맵 정보 수신에 오류가 발생했습니다.',
        },
      };
    }

    if (version < edgeServe.edge_setting_version) {
      const found = await segmentRouteMapRepository.find({
        where: {
          route_id: routeSegmentMapInfoDtoReq.data.route_id,
        },
        relations: {
          route: true,
          segment: true,
        },
      });
      if (found) {
        const routeSegmentMapInfo = found.map((s) => ({
          segment_id: s.segment_id,
          section_id: s.section_id,
        }));

        return {
          customer_id: routeSegmentMapInfoDtoReq.customer_id,
          topic: 'route_segment_map_info_RES',
          version: edgeServe.edge_setting_version,
          status: 'success',
          data: routeSegmentMapInfo,
        };
      }
    } else {
      return {
        customer_id: routeSegmentMapInfoDtoReq.customer_id,
        topic: 'route_segment_map_info_RES',
        status: 'up_to_date',
        version: edgeServe.edge_setting_version,
        data: {
          message: '현재 경로-세그먼트-맵정보는 최신입니다.',
        },
      };
    }
  }

  async guideCodeInfo(guideCodeInfoDtoReq: GuideCodeInfoDtoReq) {
    const schema = await this.customerProxy(guideCodeInfoDtoReq.customer_id);
    const guideCodeRepository = await this.fetchFromDynamicSchema(
      schema,
      GuideCodeEntity,
    );
    const workingScheduleEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      WorkingScheduleEntity,
    );
    const edgeServeEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      EdgeServeEntity,
    );
    const currentWorking = await workingScheduleEntityRepository.findOne({
      where: {
        route: {
          id: guideCodeInfoDtoReq.data.route_id,
        },
        working_date: dayjs(new Date()).startOf('day').toDate(),
      },
      relations: {
        route: true,
        vehicle: true,
      },
    });
    const version = parseFloat(guideCodeInfoDtoReq.version);
    if (!currentWorking) {
      return {
        customer_id: guideCodeInfoDtoReq.customer_id,
        topic: 'guide_code_info_RES',
        status: 'failure',
        version,
        data: {
          message: '가이드 코드 정보 수신에 오류가 발생했습니다.',
        },
      };
    }
    const edgeServe = await edgeServeEntityRepository.findOne({
      where: {
        vehicle: {
          id: currentWorking.vehicle.id,
        },
      },
      relations: {
        vehicle: true,
      },
    });
    if (!edgeServe) {
      return {
        customer_id: guideCodeInfoDtoReq.customer_id,
        topic: 'guide_code_info_RES',
        status: 'failure',
        version,
        data: {
          message: '가이드 코드 정보 수신에 오류가 발생했습니다.',
        },
      };
    }

    if (version < edgeServe.edge_setting_version) {
      const found = await guideCodeRepository.find();
      if (found) {
        return {
          customer_id: guideCodeInfoDtoReq.customer_id,
          topic: 'guide_code_info_RES',
          version: edgeServe.edge_setting_version,
          status: 'success',
          data: found.map((s) => ({
            code: s.code,
            description: s.description,
          })),
        };
      }
    } else {
      return {
        customer_id: guideCodeInfoDtoReq.customer_id,
        topic: 'guide_code_info_RES',
        status: 'up_to_date',
        version: edgeServe.edge_setting_version,
        data: {
          message: '현재 가이드 코드정보는 최신입니다.',
        },
      };
    }
  }

  async congestionCodeInfo(congestionCodeInfoDtoReq: CongestionCodeInfoDtoReq) {
    const schema = await this.customerProxy(
      congestionCodeInfoDtoReq.customer_id,
    );
    const congestionCodeRepository = await this.fetchFromDynamicSchema(
      schema,
      CongestionCodeEntity,
    );
    const workingScheduleEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      WorkingScheduleEntity,
    );
    const edgeServeEntityRepository = await this.fetchFromDynamicSchema(
      schema,
      EdgeServeEntity,
    );
    const currentWorking = await workingScheduleEntityRepository.findOne({
      where: {
        route: {
          id: congestionCodeInfoDtoReq.data.route_id,
        },
        working_date: dayjs(new Date()).startOf('day').toDate(),
      },
      relations: {
        route: true,
        vehicle: true,
      },
    });
    const version = parseFloat(congestionCodeInfoDtoReq.version);
    if (!currentWorking) {
      return {
        customer_id: congestionCodeInfoDtoReq.customer_id,
        topic: 'congestion_code_info_RES',
        status: 'failure',
        version,
        data: {
          message: '혼잡도 코드 정보 수신에 오류가 발생했습니다.',
        },
      };
    }
    const edgeServe = await edgeServeEntityRepository.findOne({
      where: {
        vehicle: {
          id: currentWorking.vehicle.id,
        },
      },
      relations: {
        vehicle: true,
      },
    });
    if (!edgeServe) {
      return {
        customer_id: congestionCodeInfoDtoReq.customer_id,
        topic: 'congestion_code_info_RES',
        status: 'failure',
        version,
        data: {
          message: '혼잡도 코드 정보 수신에 오류가 발생했습니다.',
        },
      };
    }

    if (version < edgeServe.edge_setting_version) {
      const found = await congestionCodeRepository.find();
      if (found) {
        return {
          customer_id: congestionCodeInfoDtoReq.customer_id,
          topic: 'congestion_code_info_RES',
          version: edgeServe.edge_setting_version,
          status: 'success',
          data: found.map((s) => ({
            code: s.code,
            description: s.description,
          })),
        };
      }
    } else {
      return {
        customer_id: congestionCodeInfoDtoReq.customer_id,
        topic: 'congestion_code_info_RES',
        status: 'up_to_date',
        version: edgeServe.edge_setting_version,
        data: {
          message: '현재 혼잡도 코드 정보는 최신입니다.',
        },
      };
    }
  }
}
