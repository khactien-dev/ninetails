import { Injectable, NotFoundException } from '@nestjs/common';
import { i } from 'mathjs';
import { DataSource } from 'typeorm';

@Injectable()
export class WorkingScheduleService {
  constructor(
    private dataSource: DataSource,
  ) {}

  async getDispatchNoByVehicleId(vehicleId: number, date: string | null, schema: string) {
    // Nếu không có ngày được cung cấp, sử dụng ngày hiện tại với định dạng yyyy-mm-dd
    if (!date) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        date = `${year}-${month}-${day}`;
    }

    // Truy vấn PostgreSQL
    const vehicle = await this.dataSource.query(
        `SELECT dispatch_no FROM "${schema}".dispatches
        WHERE vehicle_id = $1 AND date = $2;`,
        [vehicleId, date]
    );

    // Nếu không tìm thấy kết quả, ném ra lỗi NotFoundException
    if (vehicle.length === 0) {
        throw new NotFoundException('Vehicle Not Found');
    }
    
    // Trả về dispatch_no
    return vehicle[0].dispatch_no;
  }

  async getRouteIdByVehicleId(vehicleId: number, date: string | null, schema: string) {
    // Nếu không có ngày được cung cấp, sử dụng ngày hiện tại với định dạng yyyy-mm-dd
    if (!date) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        date = `${year}-${month}-${day}`;
    }

    // Truy vấn PostgreSQL
    const vehicle = await this.dataSource.query(
        `SELECT route_id FROM "${schema}".dispatches
        WHERE vehicle_id = $1 AND date = $2;`,
        [vehicleId, date]
    );

    // Nếu không tìm thấy kết quả, ném ra lỗi NotFoundException
    if (vehicle.length === 0) {
        throw new NotFoundException('Vehicle Not Found');
    }
    
    // Trả về dispatch_no
    return vehicle[0].route_id;
  }

  async getVehicleIdByDispatchNo(dispatchNo: string, schema: string) {
    const dispatch = await this.dataSource.query(
      `SELECT vehicle_id FROM "${schema}".dispatches
      where dispatch_no = '${dispatchNo}';`,
    );

    return dispatch[0].vehicle_id;
  }

  async getVehicleIdByRouteId(routeId: number, schema: string) {
    const dispatch = await this.dataSource.query(
      `SELECT vehicle_id FROM "${schema}".dispatches
      where route_id = ${routeId};`,
    );

    return dispatch[0].vehicle_id;
  }

  async getAllVehicleIdByDispatchNo(dispatchNo: string, schema: string) {
    const dispatch = await this.dataSource.query(
      `SELECT vehicle_number FROM "${schema}".dispatches ws
      LEFT JOIN "${schema}".vehicle v ON v.id = ws.vehicle_id
      where dispatch_no = '${dispatchNo}'`,
    );

    return dispatch[0];
  }

  async getAllVehicleIdByRouteId(routeId: number, schema: string, date?) {
    if (!date) {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      date = `${year}-${month}-${day}`;
    }
    
    const dispatch = await this.dataSource.query(
      `SELECT vehicle_number, vehicle_id FROM "${schema}".dispatches ws
      LEFT JOIN "${schema}".vehicle v ON v.id = ws.vehicle_id
      WHERE ws.route_id = $1 AND date = $2;`,
      [routeId, date]
    );

    if (dispatch.length > 0) { 
      const edgeServer = await this.dataSource.query(
        `select edge_name from "${schema}".edge_serve es where es.vehicle_id = ${dispatch[0]?.vehicle_id}`,
      );
      const edgeName = edgeServer[0]?.edge_name;
      return { ...dispatch[0], edgeName };
    }
  }

  async getAllSegmentId(schema: string) {
    const segmentIdList = await this.dataSource.query(
      `SELECT id FROM "${schema}".segment s`,
    );

    return segmentIdList;
  }

  async getAllDispatchNo(schema) {
    const allDispatch = await this.dataSource.query(
      `SELECT dispatch_no FROM "${schema}".dispatches`
    )
    return allDispatch
  }

  async getOperationMetrics(routeId: number, schema: string) {
    const operation = await this.dataSource.query(
      `SELECT es.operation_metrics FROM "${schema}".edge_serve es
      LEFT JOIN "${schema}".dispatches ws ON ws.vehicle_id = es.vehicle_id
      where ws.route_id = ${routeId}`,
    );
    
    if (operation.length > 0) {
      return operation[0].operation_metrics;
    } else {
      return 10;
    }
  }
}
