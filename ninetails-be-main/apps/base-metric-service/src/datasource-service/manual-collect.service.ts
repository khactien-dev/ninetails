import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as moment from 'moment';
import { DataSource } from 'typeorm';

@Injectable()
export class ManualCollectService {
  constructor(
    private dataSource: DataSource,
  ) {}

  async manualCollectDistance(routeName: string, schema: string) {
    const sum = await this.dataSource.query(
      `SELECT coalesce(sum(s.distance), 0) FROM "${schema}".route_segment_map sr 
      left join "${schema}".segments s on s.id = sr.segment_id 
      left join "${schema}".routes r on r.id = sr.route_id 
      where r.name = '${routeName}' and s.manual_collect = true;`,
    );
    return sum[0].coalesce || null;
  }

  async manualCollectDistanceBySegmentIdRouteId(
    segmentId: number,
    routeId: number,
    schema: string,
  ) {
    const sum = await this.dataSource.query(
      `SELECT coalesce(sum(s.distance), null) 
       FROM "${schema}".route_segment_map sr 
       LEFT JOIN "${schema}".segments s ON s.id = sr.segment_id 
       LEFT JOIN "${schema}".routes r ON r.id = sr.route_id 
       WHERE r.id = ${routeId} AND s.manual_collect = true;`
    );
    
    return +sum[0].coalesce || null;
  }

  async manualCollectDistanceBySegmentId(
    segmentId: number,
    routeId: number,
    date,
    schema: string
  ) {

    let newDate = new Date();
    if (date) {
      newDate = new Date(date);
    }

    const sum = await this.dataSource.query(
      `SELECT coalesce(sum(s.distance), null) 
       FROM "${schema}".route_segment_map sr 
       LEFT JOIN "${schema}".segments s ON s.id = sr.segment_id 
       LEFT JOIN "${schema}".routes r ON r.id = sr.route_id 
       WHERE r.id = ${routeId} AND s.manual_collect = true;`
    );
    return !isNaN(sum[0].coalesce) ? +sum[0].coalesce : 0;
  }
  
  async getRouteInfo(segmentId: number, schema: string) {
    try {
        const routeInfo = await this.dataSource.query(
            `SELECT 
                r.id AS route_id,
                r.name AS route_name,
                r.path AS path,
                JSON_BUILD_OBJECT(
                    'start', r.start,
                    'goal', r.goal,
                    'distance', r.distance,
                    'duration', r.duration,
                    'bbox', r.bbox,
                    'collectCount', r.collect_count
                ) AS summary,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'name', sec.name,
                        'pointIndex', sec.point_index,
                        'pointCount', sec.point_count,
                        'distance', sec.distance,
                        'congestion', sec.congestion,
                        'collectCount', sec.collect_count
                    )
                ) AS sections
            FROM ${schema}.route_segment_map sr
            LEFT JOIN ${schema}.segments s ON s.id = sr.segment_id
            LEFT JOIN ${schema}.routes r ON r.id = sr.route_id
            LEFT JOIN ${schema}.sections sec ON r.id = sec.route_id
            WHERE s.id = $1
            GROUP BY r.id, r.name`,
            [segmentId]
        );

        return routeInfo;
    } catch (error) {
        console.error("Error fetching route info:", error);
        throw error;
    }
  }
}
