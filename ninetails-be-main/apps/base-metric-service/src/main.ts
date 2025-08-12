import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { BaseMetricModule } from './base-metric.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BaseMetricService } from './base-metric.service';

async function bootstrap() {
  const app = await NestFactory.create(BaseMetricModule, {
    forceCloseConnections: true,
    cors: true,
  });
  app.enableShutdownHooks();
  const config = new DocumentBuilder()
    .setTitle(process.env.APP_NAME)
    .addServer('/api/base-metric')
    .setDescription(`The ${process.env.APP_NAME} description`)
    .addBearerAuth()
    .addGlobalParameters(
      {
        in: 'header',
        required: false,
        name: 'schema',
      },
      {
        in: 'header',
        required: false,
        name: 'opid',
      },
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);

  app.enableCors({
    origin: '*',
  });
  app.setGlobalPrefix('/api/base-metric');
  app.useGlobalPipes(new ValidationPipe());
  SwaggerModule.setup('/api-docs', app, document, { useGlobalPrefix: true });

  const port = process.env.METRIC_SERVICE_PORT ?? 3000;
  await app.listen(port, () => {
    console.log(
      `🚀 Application is running on: http://localhost:${port}/api/base-metric`,
    );
  });

  const baseMetricService = await app.resolve(BaseMetricService);
  baseMetricService.onModuleInit();
}

bootstrap();
