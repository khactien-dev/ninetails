import { Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { DemoRequestEntity } from 'libs/entities/demo-request.entity';
import { ContactRequestEntity } from 'libs/entities/contact-request.entity';
import { DemoRequestController } from './demo-request/demo-request.controller';
import { ContactRequestController } from './contact-request/contact-request.controller';
import { DemoRequestService } from './demo-request/demo-request.service';
import { ContactRequestService } from './contact-request/contact-request.service';
import { SubscriptionEntity } from 'libs/entities/subcription.entity';
import { SubscriptionService } from './demo-request/subscription.service';
import { ReceiveMailController } from './receive-mail/receive-mail.controller';
import { ReceiveMailService } from './receive-mail/receive-mail.service';
import { ReceiveMailEntity } from 'libs/entities/receive-mail.entity';
import { OpenSearchLoggerModule } from 'libs/common/logger/opensearch-logger.module';
import { ROLLING_INDEX_MODE } from 'libs/common/logger/opensearch-logger.utilities';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ElasticsearchRequestInterceptor } from 'libs/common/logger/opensearch-logger.interceptor';
import { ExceptionHandleError } from 'libs/utils/http-exception.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as any,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [
        DemoRequestEntity,
        ContactRequestEntity,
        SubscriptionEntity,
        ReceiveMailEntity,
      ],
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      DemoRequestEntity,
      ContactRequestEntity,
      SubscriptionEntity,
      ReceiveMailEntity,
    ]),
    MailModule,
    OpenSearchLoggerModule.forRoot({
      indexPrefix: 'form-api-service',
      rollingOffsetMode: ROLLING_INDEX_MODE.MONTHLY,
      name: 'form-api-service',
      stdout: true,
      openSearchClientOptions: {
        node: process.env.OPENSEARCH_SERVER ?? 'http://opensearch:9300',
        ssl: { rejectUnauthorized: false },
      },
    }),
  ],
  controllers: [
    DemoRequestController,
    ContactRequestController,
    ReceiveMailController,
  ],
  providers: [
    DemoRequestService,
    ContactRequestService,
    SubscriptionService,
    ReceiveMailService,
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: ElasticsearchRequestInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionHandleError,
    },
  ],
})
export class MainModule {}
