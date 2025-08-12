import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import path from 'node:path';
@Injectable()
export class RouteInfoService {
  constructor(
    private dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async calculateOtherDistanceAndTime(segmentLines: any[]) {
    const findSegment = (type: string) => segmentLines.find(seg => seg.segment_type === type);
  
    const garage = findSegment('GARAGE');
    const entry = findSegment('ENTRY');
    const landfill = findSegment('LANDFILL');
  
    const API_HEADERS = {
      'X-NCP-APIGW-API-KEY-ID': 'qqdzmppwz8',
      'X-NCP-APIGW-API-KEY': 'GCCe7f0i351vrDKDm3cm2tMv2HGJRQOKDDPTvzeD'
    };
  
    const getDistanceAndTime = async (start: number[], goal: number[]) => {
      const url = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${start[0]},${start[1]}&goal=${goal[0]},${goal[1]}&option=trafast`;
      const { data } = await axios.get(url, { headers: API_HEADERS });
  
      const summary = data?.route?.trafast?.[0]?.summary;
      return {
        distance: summary?.distance ?? 0,
        duration: summary?.duration ?? 0
      };
    };
  
    const tasks: Promise<{ distance: number; duration: number }>[] = [];
  
    // Distance A: GARAGE → ENTRY
    if (garage?.coordinate?.length && entry?.coordinate?.length) {
      const start = garage.coordinate[0];
      const goal = entry.coordinate[0];
      tasks.push(getDistanceAndTime(start, goal));
    }
  
    // Distance B: ENTRY → LANDFILL
    if (entry?.coordinate?.length && landfill?.coordinate?.length) {
      const start = entry.coordinate[entry.coordinate.length - 1];
      const goal = landfill.coordinate[0];
      tasks.push(getDistanceAndTime(start, goal));
    }
  
    // Distance C: LANDFILL → GARAGE
    if (landfill?.coordinate?.length && garage?.coordinate?.length) {
      const start = landfill.coordinate[landfill.coordinate.length - 1];
      const goal = garage.coordinate[0];
      tasks.push(getDistanceAndTime(start, goal));
    }
  
    const results = await Promise.all(tasks);
  
    const otherDistance = results.reduce((sum, cur) => sum + cur.distance, 0);
    const otherTime = results.reduce((sum, cur) => sum + cur.duration, 0) / 1000;
  
    return { otherDistance, otherTime };
  }

  async getAllRouteSimulationInfo(schema: string) {
  try {
    // Truy vấn song song dữ liệu
    const [routeInfoArray, guideCodes, congestionCodes, metaData] = await Promise.all([
      this.dataSource.query(
        `SELECT 
          JSON_BUILD_OBJECT(
            'id', r.id,
            'type', r.type,
            'name', r.name,
            'path', ST_AsGeoJSON(r.path)::json -> 'coordinates',
            'start', ST_AsGeoJSON(r.start)::json -> 'coordinates',
            'goal', ST_AsGeoJSON(r.goal)::json -> 'coordinates',
            'distance', r.distance,
            'duration', r.duration,
            'bbox', ST_AsGeoJSON(r.bbox)::json -> 'coordinates',
            'collectCount', r.collect_count,
            'collectVolume', r.collect_volume
          ) AS routes,
          JSON_BUILD_OBJECT(
            'id', s.id,
            'segment_line', ST_AsGeoJSON(s.segment_line)::json -> 'coordinates',
            'distance', s.distance,
            'name', s.name,
            'congestion', s.congestion,
            'duration', s.duration,
            'must_pass', s.must_pass,
            'manual_collect', s.manual_collect,
            'collect_count', s.collect_count,
            'collect_volume', s.collect_volume
          ) AS segments,
          JSON_BUILD_OBJECT(
            'id', sec.id,
            'route_id', sec.route_id,
            'pointIndex', sec.point_index,
            'pointCount', sec.point_count,
            'distance', sec.distance,
            'name', sec.name,
            'congestion', sec.congestion,
            'duration', sec.duration,
            'collect_count', sec.collect_count,
            'collect_volume', sec.collect_volume
          ) AS sections,
          JSON_BUILD_OBJECT(
            'id', g.id,
            'route_id', g.route_id,
            'pointIndex', g.point_index,
            'pointCount', g.point_count,
            'type', g.type,
            'instructions', g.instructions,
            'distance', g.distance,
            'duration', g.duration,
            'bbox', ST_AsGeoJSON(g.bbox)::json -> 'coordinates'
          ) AS guides,
          JSON_BUILD_OBJECT(
            'id', cs.id,
            'name', cs.name,
            'segment_id', cs.segment_id,
            'pointIndex', "pointIndex",
            'route_id', cs.route_id,
            'route_type', cs.route_type,
            'type', cs.type
          ) AS core_sections,
          JSON_BUILD_OBJECT(
            'id', sr.id,
            'route_id', sr.route_id,
            'segment_id', sr.segment_id,
            'section_id', sr.section_id
          ) AS route_segment_map
        FROM ${schema}.route_segment_map sr
        LEFT JOIN ${schema}.segments s ON s.id = sr.segment_id
        LEFT JOIN ${schema}.routes r ON r.id = sr.route_id
        LEFT JOIN ${schema}.sections sec ON r.id = sec.route_id
        LEFT JOIN ${schema}.core_sections cs ON cs.segment_id = sr.segment_id AND cs.route_id = r.id
        LEFT JOIN ${schema}.guides g ON g.route_id = r.id
        GROUP BY r.id, r.name, r.path, r.start, r.goal, r.distance, r.duration, r.bbox, r.collect_count, 
                 r.collect_volume, s.id, s.segment_line, s.distance, s.name, s.congestion, s.duration, s.must_pass,
                 s.manual_collect, s.collect_count, s.collect_volume,
                 sec.id, sec.route_id, sec.point_index, sec.point_count, sec.distance, sec.name, sec.congestion, sec.duration, sec.collect_count, sec.collect_volume,
                 g.id, g.route_id, g.point_index, g.point_count, g.type, g.instructions, g.distance, g.duration, g.bbox,
                 cs.id, cs.name, cs.segment_id, "pointIndex", cs.route_id, cs.route_type, cs.type,
                 sr.id, sr.route_id, sr.segment_id, sr.section_id`
      ),
      this.getGuideCodes(schema),
      this.getCongestionCodes(schema),
      this.getMetaData(schema)
    ]);

    return {
      routes: routeInfoArray,
      guideCodes: guideCodes,
      congestionCodes: congestionCodes,
      metaData: metaData
    };
  } catch (error) {
    console.error("Error fetching route info:", error);
    throw error;
  }
  }
  
  async getRouteSimulationInfo(routeId: number, schema: string) {
    try {
      const routeInfoArray = await this.dataSource.query(
        `SELECT 
            r.id AS route_id,
            r.name AS route_name,
            (ST_AsGeoJSON(r.path)::json -> 'coordinates') AS path,
            JSON_BUILD_OBJECT(
                'start', ST_AsGeoJSON(r.start)::json -> 'coordinates',
                'goal', ST_AsGeoJSON(r.goal)::json -> 'coordinates',
                'distance', r.distance,
                'duration', r.duration,
                'bbox', ST_AsGeoJSON(r.bbox)::json -> 'coordinates',
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
            ) AS sections,
            COUNT(DISTINCT sr.segment_id)::INT AS "numberOfSegment",
            SUM(CASE WHEN s.manual_collect = false THEN r.distance ELSE 0 END)::FLOAT AS "collectDistance",
            SUM(CASE WHEN s.manual_collect = false THEN r.duration ELSE 0 END)::FLOAT AS "collectTime",
            SUM(s.collect_count)::INT AS "collectCount",
            SUM(CASE WHEN s.manual_collect = false THEN s.collect_count ELSE 0 END)::INT AS "vehicleCollect",
            SUM(CASE WHEN s.manual_collect = true THEN s.collect_count ELSE 0 END)::INT AS "manualCollect",
            0::FLOAT AS "otherDistance",
            0::FLOAT AS "otherTime",
            0::FLOAT AS "timeRatio",
            0::FLOAT AS "distanceRatio",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'segment_id', s.id,
                    'segment_type', cs.type,
                    'coordinate', ST_AsGeoJSON(s.segment_line)::json -> 'coordinates'
                )
            ) AS segment_line
        FROM ${schema}.route_segment_map sr
        LEFT JOIN ${schema}.segments s ON s.id = sr.segment_id
        LEFT JOIN ${schema}.routes r ON r.id = sr.route_id
        LEFT JOIN ${schema}.sections sec ON r.id = sec.route_id
        LEFT JOIN ${schema}.core_sections cs ON cs.segment_id = sr.segment_id AND cs.route_id = r.id
        WHERE r.id = $1
        GROUP BY r.id, r.name, r.path, r.start, r.goal, r.distance, r.duration, r.bbox, r.collect_count`,
        [routeId]
      );

      if (routeInfoArray.length === 0) {
        throw new Error('Route not found');
      }
  
      const routeInfo = routeInfoArray[0];
  
      const { otherDistance, otherTime } = await this.calculateOtherDistanceAndTime(routeInfo.segment_line || []);
  
      routeInfo.otherDistance = otherDistance;
      routeInfo.otherTime = otherTime;
      
      return routeInfo;
    } catch (error) {
      console.error("Error fetching route info:", error);
      throw error;
    }
  }  

  async getRouteInfoByRouteId(schema: string) {
    const routeInfo = await this.dataSource.query(
        `SELECT 
            r.id AS id,
            r.type AS type,
            r.name AS name,
            (ST_AsGeoJSON(r.path)::json -> 'coordinates') AS path,
            (ST_AsGeoJSON(r.start)::json -> 'coordinates') AS start,
            (ST_AsGeoJSON(r.goal)::json -> 'coordinates') AS goal,
            r.distance AS distance,
            r.duration AS duration,
            (ST_AsGeoJSON(r.bbox)::json -> 'coordinates') AS bbox,
            r.collect_count AS collect_count,
            r.collect_volume AS collect_volume,
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', sec.id,
                    'name', sec.name,
                    'pointIndex', sec.point_index,
                    'pointCount', sec.point_count,
                    'distance', sec.distance,
                    'congestion', sec.congestion,
                    'collectCount', sec.collect_count
                )
            ) AS route_sections,
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'segment_id', s.id,
                    'segment_type', cs.type,
                    'coordinate', ST_AsGeoJSON(s.segment_line)::json -> 'coordinates'
                )
            ) AS route_segment
        FROM ${schema}.route_segment_map sr
        LEFT JOIN ${schema}.segments s ON s.id = sr.segment_id
        LEFT JOIN ${schema}.routes r ON r.id = sr.route_id
        LEFT JOIN ${schema}.sections sec ON r.id = sec.route_id
        LEFT JOIN ${schema}.core_sections cs ON cs.segment_id = sr.segment_id AND cs.route_id = r.id
        GROUP BY r.id, r.name, r.path, r.start, r.goal, r.distance, r.duration, r.bbox, r.collect_count
        ORDER BY r.id ASC`
      );
    if (routeInfo.length === 0) {
      return [
        {
          id: 0,
          type: null,
          name: null,
          path: null,
          start: null,
          goal: null,
          distance: null,
          duration: null,
          bbox: null,
          collect_count: null,
          collect_volume: null,
        }
      ]
    }
    return routeInfo;
  }

  async getSegmentInfoByRouteId(schema: string) {
    const segmentInfoArray = await this.dataSource.query(
        `SELECT 
          s.id as id,
          (ST_AsGeoJSON(s.segment_line)::json -> 'coordinates') AS segment_line,
          s.distance as distance,
          s.name as name,
          s.congestion as congestion,
          s.duration as duration,
          s.must_pass as must_pass,
          s.manual_collect as manual_collect,
          s.collect_count as collect_count,
          s.collect_volume as collect_volume
        FROM ${schema}.segments s
        LEFT JOIN ${schema}.route_segment_map sr ON s.id = sr.segment_id
        LEFT JOIN ${schema}.routes r ON r.id = sr.route_id ORDER BY s.id ASC`
      );
    if (segmentInfoArray.length === 0) {
      return [
        {
          id: 0,
          segment_line: null,
          distance: null,
          name: null,
          congestion: null,
          duration: null,
          must_pass: null,
          manual_collect: null,
          collect_count: null,
          collect_volume: null,
        }
      ]
    }
    return segmentInfoArray;
  }

  async getSectionInfoByRouteId(schema: string) {
    const sectionInfoArray = await this.dataSource.query(
        `SELECT 
          s.id as id,
          s.route_id as route_id,
          s.point_index as pointIndex,
          s.point_count as pointCount,
          s.distance as distance,
          s.name as name,
          s.congestion as congestion,
          s.duration as duration,
          s.collect_count as collect_count,
          s.collect_volume as collect_volume
        FROM ${schema}.sections s
        LEFT JOIN ${schema}.routes r ON r.id = s.route_id ORDER BY s.id ASC`
      );
    if (sectionInfoArray.length === 0) {
      return [
        {
          id: 0,
          route_id: 0,
          pointIndex: null,
          pointCount: null,
          distance: null,
          name: null,
          congestion: null,
          duration: null,
          collect_count: null,
          collect_volume: null,
        }
      ]
    }
    return sectionInfoArray;
  }

  async getGuideInfoByRouteId(schema: string) {
    const guideInfoArray = await this.dataSource.query(
      `SELECT 
        g.id as id,
        g.route_id as route_id,
        g.point_index as pointIndex,
        g.point_count as pointCount,
        g.type as type,
        g.instructions as instructions,
        g.distance as distance,
        g.duration as duration,
        (ST_AsGeoJSON(g.bbox)::json -> 'coordinates') AS bbox
      FROM ${schema}.guides g
      LEFT JOIN ${schema}.routes r ON r.id = g.route_id ORDER BY g.id ASC`)

      if (guideInfoArray.length === 0) {
        return [
          {
            id: 0,
            route_id: 0,
            pointIndex: null,
            pointCount: null,
            type: null,
            instructions: null,
            distance: null,
            duration: null,
            bbox: null
          }
        ]
      }
      return guideInfoArray;
  }

  async getCoreSectionInfoByRouteId(schema: string) {
    const coreSectionInfoArray = await this.dataSource.query(
      `SELECT 
        cs.id as id,
        cs.name as name,
        cs.segment_id as segment_id,
        "pointIndex",
        cs.route_id as route_id,
        cs.route_type as route_type,
        cs.type as type
      FROM ${schema}.core_sections cs
      LEFT JOIN ${schema}.routes r ON r.id = cs.route_id ORDER BY cs.id ASC`)
      if (coreSectionInfoArray.length === 0) {
        return [
          {
            id: 0,
            name: null,
            segment_id: null,
            pointIndex: null,
            route_id: 0,
            route_type: null,
            type: null
          }
        ]
      }
      return coreSectionInfoArray;
  }

  async getRouteSegmentMapInfoByRouteId(schema: string) {
    const routeSegmentMapInfoArray = await this.dataSource.query(
      `SELECT 
        sr.id as id,
        sr.route_id as route_id,
        sr.segment_id as segment_id,
        sr.section_id as section_id
      FROM ${schema}.route_segment_map sr
      LEFT JOIN ${schema}.segments s ON s.id = sr.segment_id
      LEFT JOIN ${schema}.routes r ON r.id = sr.route_id ORDER BY sr.id ASC`)
      if (routeSegmentMapInfoArray.length === 0) {
        return [
          {
            id: 0,
            route_id: 0,
            segment_id: null,
            section_id: null
          }
        ]
      }
      return routeSegmentMapInfoArray;
  }

  async getGuideCodes(schema: string) {
    const guideCodes = await this.dataSource.query(
      `SELECT code, description FROM ${schema}.guide_codes ORDER BY code ASC`
    )

    if (guideCodes.length === 0) {
      return [
        {
          code: null,
          description: null
        }
      ]
    }

    return guideCodes;
  }

  async getCongestionCodes(schema: string) {
    const congestionCode = await this.dataSource.query(
      `SELECT code, description FROM ${schema}.congestion_codes ORDER BY code ASC`
    )

    if (congestionCode.length === 0) {
      return [
        {
          code: null,
          description: null
        }
      ]
    }

    return congestionCode;
  }

  async getMetaData(schema: string) {
    const metaData = await this.dataSource.query(
      `SELECT update_time, table_name, version, updated_by FROM ${schema}.metadata ORDER BY update_time DESC`
    )

    if (metaData.length === 0) {
      return [
        {
          update_time: null,
          table_name: null,
          version: null,
          updated_by: null
        }
      ]
    }

    return metaData;
  }

  async getRouteDatasetInfo(schema: string) {
    try {
      const routeInfo = await this.getRouteInfoByRouteId(schema);
      const segmentInfo = await this.getSegmentInfoByRouteId(schema);
      const sectionInfo = await this.getSectionInfoByRouteId(schema);
      const guideInfo = await this.getGuideInfoByRouteId(schema);
      const coreSectionInfo = await this.getCoreSectionInfoByRouteId(schema);
      const routeSegmentMapInfo = await this.getRouteSegmentMapInfoByRouteId(schema);
      const guideCodes = await this.getGuideCodes(schema);
      const congestionCode = await this.getCongestionCodes(schema);
      const metaData = await this.getMetaData(schema);
      const result = {
        routes: routeInfo,
        segments: segmentInfo,
        sections: sectionInfo,
        guides: guideInfo,
        core_sections: coreSectionInfo,
        route_segment_map: routeSegmentMapInfo,
        guide_codes: guideCodes,
        congestion_codes: congestionCode,
        metadata: metaData,
      } 

      return result;
    } catch (error) {
      console.error("Error fetching route info:", error);
      throw error;
    }
  } 

  async getAllSegments(schema: string) {
    try {
      const routeInfoArray = await this.dataSource.query(`
        SELECT 
          ST_AsGeoJSON(s.segment_line)::json -> 'coordinates' AS segment_line
        FROM ${schema}.segments s
      `);
  
      // Loại bỏ key segment_line
      const cleanedSegments = routeInfoArray.map((item: any) => item.segment_line);
      return cleanedSegments;
    } catch (error) {
      console.error("Error fetching route info:", error);
      throw error;
    }
  }
  
  

  async getRouteInfo(segmentId: number, schema: string) {
    try {
      const routeInfo = await this.dataSource.query(
        `SELECT 
            r.id AS route_id,
            r.name AS route_name,
            (ST_AsGeoJSON(r.path)::json -> 'coordinates') AS path,
            JSON_BUILD_OBJECT(
                'start', ST_AsGeoJSON(r.start)::json -> 'coordinates',
                'goal', ST_AsGeoJSON(r.goal)::json -> 'coordinates',
                'distance', r.distance,
                'duration', r.duration,
                'bbox', ST_AsGeoJSON(r.bbox)::json -> 'coordinates',
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

  async getSegmentIdByRouteName(routeName: string, schema: string) {
    const segmentId = await this.dataSource.query(
        `SELECT segment_id FROM "${schema}".route_segment_map sr 
        left join "${schema}".segments s on s.id = sr.segment_id 
        left join "${schema}".routes r on r.id = sr.route_id 
        where r.name = '${routeName}'`,
      );
      
    return segmentId[0].segment_id;
  }

  async getSegmentIdByRouteIdAndSegmentId(routeId: number, segmentId: number, schema: string) {
    const segmentIds = await this.dataSource.query(
        `SELECT segment_id, route_id FROM "${schema}".route_segment_map sr 
        left join "${schema}".segments s on s.id = sr.segment_id 
        left join "${schema}".routes r on r.id = sr.route_id 
        where r.id = ${routeId} AND sr.segment_id = ${segmentId}`,
      );

      if (segmentIds.length > 0) {
        return segmentIds[0].segment_id;
      }
  }

  async getSegmentIdAndRouteIdByRouteIdAndSegmentId(routeId: number, segmentId: number, schema: string) {
    const segmentIds = await this.dataSource.query(
        `SELECT segment_id, route_id FROM "${schema}".route_segment_map sr 
        left join "${schema}".segments s on s.id = sr.segment_id 
        left join "${schema}".routes r on r.id = sr.route_id 
        where r.id = ${routeId} AND sr.segment_id = ${segmentId}`,
      );
      
    if (segmentIds.length > 0) {
      return {
        route_id: segmentIds[0].route_id,
        segment_id: segmentIds[0].segment_id,
      };
    }
  }

  async getSectionIdyRouteIdAndSegmentId(routeId: number, segmentId: number, schema: string) {
    const section = await this.dataSource.query(
        `SELECT section.id FROM "${schema}".sections
        left join "${schema}".routes on route.id = section.route_id 
        left join "${schema}".route_segment_map on route.id = route_segment_map.route_id 
        left join "${schema}".segments on segment.id = route_segment_map.segment_id 
        where route.id = ${routeId} AND segment.id = ${segmentId}`,
      );
      
    return {
      section_id: section[0].id,
    };
  }

  async getSectionNameBySectionIdAndRouteId(sectionId: number, routeId: number, schema: string) {
    const sectionName = await this.dataSource.query(
      `SELECT s.name FROM "${schema}".sections s 
        left join "${schema}".routes r on r.id = s.route_id 
        where r.id = ${routeId} AND s.id = ${sectionId}`
    )
    
    return sectionName[0].name;
  }

  async getRouteNameBySegmentId(segmentId: number, schema: string) {
    const routeName = await this.dataSource.query(
        `SELECT r.name FROM "${schema}".route_segment_map sr 
        left join "${schema}".segments s on s.id = sr.segment_id 
        left join "${schema}".routes r on r.id = sr.route_id
        where s.id = ${segmentId}`,
      );
      
    return routeName[0];
  }

  async getRouteNameByRouteId(routeId: number, schema: string) {
    const routeName = await this.dataSource.query(
        `SELECT r.name FROM "${schema}".route_segment_map sr 
        left join "${schema}".routes r on r.id = sr.route_id
        where r.id = ${routeId}`,
      );
      
    return routeName[0];
  }

  async getRouteNameBySegmentIdAndRouteId(segmentId: number, routeId: number, schema: string) {
    const routeName = await this.dataSource.query(
        `SELECT r.name FROM "${schema}".route_segment_map sr 
        left join "${schema}".segments s on s.id = sr.segment_id 
        left join "${schema}".routes r on r.id = sr.route_id
        where where sr.route_id = ${routeId} AND sr.segment_id = ${segmentId}`,
      );
      
    return routeName[0];
  }

  async getRouteIdByRouteName(routeName: string, schema: string) {
    const routeId = await this.dataSource.query(
        `SELECT id FROM "${schema}".routes 
        where name = '${routeName}'`,
      );
      
    return routeId[0];
  }

  async getAllSegmentId(schema: string) {
    const segment = await this.dataSource.query(
      `SELECT segment_id FROM "${schema}".route_segment_map sr 
      left join "${schema}".segments s on s.id = sr.segment_id 
      left join "${schema}".routes r on r.id = sr.route_id`
    );
    
  return segment;
  }

  async getSegmentIdsByRouteNames(routeNames: string[], schema: string) {
    // Kiểm tra nếu mảng routeNames rỗng
    if (!routeNames || routeNames.length === 0) {
        return null; // Hoặc trả về [] nếu bạn muốn trả về một mảng rỗng
    }

    // Chuyển mảng routeNames thành chuỗi các giá trị để dùng trong truy vấn SQL
    const routeNamesList = routeNames.map(name => `'${name}'`).join(', ');

    const segmentIds = await this.dataSource.query(
      `SELECT DISTINCT s.id FROM "${schema}".route_segment_map sr 
       LEFT JOIN "${schema}".segments s ON s.id = sr.segment_id 
       LEFT JOIN "${schema}".routes r ON r.id = sr.route_id 
       WHERE r.name IN (${routeNamesList}) AND sr.deleted_at IS NULL`
    );

    // Trả về danh sách các segment_id
    return segmentIds.map(row => row.id);
  }

  async getRouteNamesByRouteIds(routeIds: number[], schema: string) {
    if (!routeIds || routeIds.length === 0) {
      return
    }
    const routeIdsList = routeIds.map(id => `${id}`).join(', ');
  
    const segmentIds = await this.dataSource.query(
      `SELECT DISTINCT r.name FROM "${schema}".routes r 
       WHERE r.id IN (${routeIdsList})`
    );
  
    // Trả về danh sách các segment_id
    return segmentIds.map(row => row.name);
  }

  async getAllRouteName(schema: string) {
    const routeNames = await this.dataSource.query(
      `SELECT DISTINCT r.name FROM "${schema}".routes r`
    );
  
    // Trả về danh sách các segment_id
    return routeNames.map(row => row.name);
  } 

  async getSectionIdByRouteIdAndSectionName(routeId: number, sectionName: string, schema: string) {
    const section = await this.dataSource.query(
      `SELECT DISTINCT s.id FROM "${schema}".sections s
       LEFT JOIN "${schema}".routes r ON r.id = s.route_id
       WHERE r.id = ${routeId} AND s.name = '${sectionName}'`
    );

    return section[0].id;
  }
}
