import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MasterModule } from './master.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(MasterModule, {
    forceCloseConnections: true,
  });
  app.enableShutdownHooks();
  const config = new DocumentBuilder()
    .setTitle(process.env.APP_NAME)
    .addServer('/api/notification')
    .setDescription(`The ${process.env.APP_NAME} description`)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  app.enableCors({
    origin: '*',
  });
  app.setGlobalPrefix('/api/notification');
  app.useGlobalPipes(new ValidationPipe());
  SwaggerModule.setup('/api-docs', app, document, { useGlobalPrefix: true });

  const port = process.env.NOTIFICATION_SERVICE_PORT ?? 3000;
  app.listen(port, () => {
    console.log(
      `🚀 Application is running on: http://localhost:${port}/api/notification`,
    );
  });
}

bootstrap();
