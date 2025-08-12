import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CoreSectionService {
  constructor(
    private dataSource: DataSource,
  ) {}

  async getCoreSectionByRouteId(routeId: number, schema: string) {
    const coreSection = await this.dataSource.query(
      `SELECT cs.name, cs.type, s.segment_line FROM "${schema}".core_sections cs
      LEFT JOIN "${schema}".segments s ON s.id = cs.segment_id
      LEFT JOIN "${schema}".routes r ON r.id = cs.route_id
      WHERE cs.route_id = ${routeId};`
    );

    if (!coreSection) {
        return null
    }
    
    return coreSection
  }
}
