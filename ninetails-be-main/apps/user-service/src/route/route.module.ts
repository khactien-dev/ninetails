import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { RouteService } from './services/route.service';
import { RouteController } from './controllers/route.controller';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { AuthMiddleware } from '../guards/auth.middleware';
import { RoleBackUpMiddleware } from '../guards/role.middleware';
import { SectionService } from './services/section.service';
import { SegmentService } from './services/segment.service';
import { SegmentRouteMapService } from './services/segment-route-map.service';
import { SectionController } from './controllers/section.controller';
import { SegmentController } from './controllers/segment.controller';
import { PointService } from './services/point.service';
import { RevertDataModule } from '../revert-data/revert.module';
import { PointController } from './controllers/point.controller';
import { CoreSectionService } from './services/core-section.service';
import { CongestionService } from './services/congestion.service';
import { GuideController } from './controllers/guide.controller';
import { GuideService } from './services/guide.service';
import { MetadataController } from './controllers/metadata.controller';
import { MetadataService } from './services/metadata.service';
import { RouteImportService } from 'libs/utils/route-import.service';
import { CongestionController } from './controllers/congestion.controller';
import { CoreSectionController } from './controllers/core-section.controller';
import { SegmentRouteController } from './controllers/segment-route.controller';
import { DownloadService } from 'libs/utils/download.service';
import { ExportController } from './controllers/export.controller';

@Module({
  imports: [RevertDataModule],
  providers: [
    RouteService,
    ...DataSourceProvider,
    SectionService,
    SegmentService,
    SegmentRouteMapService,
    PointService,
    CoreSectionService,
    CongestionService,
    GuideService,
    MetadataService,
    RouteImportService,
    DownloadService,
  ],
  controllers: [
    RouteController,
    SectionController,
    SegmentController,
    PointController,
    GuideController,
    MetadataController,
    CongestionController,
    CoreSectionController,
    SegmentRouteController,
    ExportController,
  ],
})
export class RouteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(RouteController);
    consumer.apply(AuthMiddleware).forRoutes(SegmentController);
    consumer.apply(AuthMiddleware).forRoutes(SectionController);
    consumer.apply(AuthMiddleware).forRoutes(PointController);
    consumer.apply(AuthMiddleware).forRoutes(MetadataController);
    consumer.apply(AuthMiddleware).forRoutes(CongestionController);
    consumer.apply(AuthMiddleware).forRoutes(GuideController);
    consumer.apply(AuthMiddleware).forRoutes(CoreSectionController);
    consumer.apply(AuthMiddleware).forRoutes(SegmentRouteController);
    consumer.apply(AuthMiddleware).forRoutes(ExportController);
    // consumer
    //   .apply(RoleBackUpMiddleware)
    //   .forRoutes(
    //     { path: '/route/create', method: RequestMethod.ALL },
    //     { path: '/route/import', method: RequestMethod.ALL },
    //     { path: '/route/update-many', method: RequestMethod.ALL },
    //     { path: '/segment/delete-many', method: RequestMethod.ALL },
    //     { path: '/section/create', method: RequestMethod.ALL },
    //     { path: '/section/import', method: RequestMethod.ALL },
    //     { path: '/section/update-many', method: RequestMethod.ALL },
    //     { path: '/section/delete-many', method: RequestMethod.ALL },
    //     { path: '/segment/create', method: RequestMethod.ALL },
    //     { path: '/segment/import', method: RequestMethod.ALL },
    //     { path: '/segment/update-many', method: RequestMethod.ALL },
    //     { path: '/segment/delete-many', method: RequestMethod.ALL },
    //     { path: '/guide/**', method: RequestMethod.ALL },
    //     { path: '/metadata/**', method: RequestMethod.ALL },
    //     { path: '/congestion/**', method: RequestMethod.ALL },
    //     { path: '/core-section/**', method: RequestMethod.ALL },
    //     { path: '/segment-route/**', method: RequestMethod.ALL },
    //   );
  }
}
