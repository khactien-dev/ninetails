import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '../guards/auth.middleware';
import { RoleDispatchMiddleware } from '../guards/role.middleware';
import { SignatureEntity } from 'libs/entities/signature.entity';
import { SignatureService } from './services/signature.service';
import { SignatureController } from './controllers/signature.controller';
import { RecordController } from './controllers/record.controller';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { RecordService } from './services/record.service';
import { DiaryController } from './controllers/diary.controller';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';
import { DiaryService } from './services/diary.service';
import { BackupEntity } from 'libs/entities/backup.entity';
import {
  DiaryCreateMiddleware,
  DiaryUpdateMiddleware,
} from '../guards/diary.middleware';
import { DownloadService } from 'libs/utils/download.service';
import { EncryptDataService } from 'libs/utils/encrypt-data';
import { FileService } from 'libs/utils/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([SignatureEntity, BackupEntity])],
  providers: [
    SignatureService,
    RecordService,
    DiaryService,
    DownloadService,
    EncryptDataService,
    FileService,
    ...DataSourceProvider,
    {
      provide: 'OpenSearchClient',
      useFactory: async (configService: ConfigService) => {
        return new Client({
          node: configService.get<string>('OPENSEARCH_SERVER'),
          ssl: {
            rejectUnauthorized: false,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [SignatureController, RecordController, DiaryController],
})
export class DrivingDiaryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(SignatureController, RecordController, DiaryController)
      .apply(DiaryUpdateMiddleware, DiaryCreateMiddleware)
      .forRoutes(
        { path: 'signature/sign', method: RequestMethod.ALL },
        // { path: 'signature/get', method: RequestMethod.ALL },
        { path: 'signature/create', method: RequestMethod.ALL },
        { path: 'signature/delete', method: RequestMethod.ALL },
        { path: 'driving-record/drive/save', method: RequestMethod.ALL },
        { path: 'driving-record/landfill/create', method: RequestMethod.ALL },
        { path: 'driving-record/landfill/update/*', method: RequestMethod.ALL },
      );
  }
}
