import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class VehicleInfoService {
  constructor(
    private dataSource: DataSource,
  ) {}

  async getVehicleIdByVehicleNumber(vehicleNumber: string, schema: string) {
    const vehicle = await this.dataSource.query(
        `SELECT id FROM "${schema}".vehicle
        where vehicle_number = '${vehicleNumber}';`,
    );

    if (vehicle[0].id === undefined) {
      throw new NotFoundException('Vehicle Not Found');
    }

    return vehicle[0].id;
  }

  async getVehicleInfoByVehicleNumber(vehicleNumber: string, schema: string) {
    const vehicle = await this.dataSource.query(
      `SELECT * FROM "${schema}".vehicle
      where vehicle_number = '${vehicleNumber}';`,
    );

    if (!vehicle) {
      throw new NotFoundException('Vehicle Not Found');
    }

    return vehicle;
  }

  async getVehicleInfoByVehicleId(vehicleId: number, schema: string) {
    const vehicle = await this.dataSource.query(
      `SELECT * FROM "${schema}".vehicle
      WHERE id = ${vehicleId};`
    );
    
    return vehicle
  }
}
