import { NestFactory } from '@nestjs/core';
import { LocationModule } from './location.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(LocationModule);
  // RabbitMQ
  // const configService = app.get(ConfigService);
  // const sharedService = app.get(SharedService);

  // const queue = configService.get('RABBITMQ_AUTH_QUEUE');

  // app.connectMicroservice(sharedService.getRmqOptions(queue));

  // TCP
  const config = new DocumentBuilder()
    .setTitle(process.env.APP_NAME)
    .addServer('/api/location')
    .setDescription(`The ${process.env.APP_NAME} description`)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.enableCors({
    origin: '*',
  });
  app.setGlobalPrefix('/api/location');

  app.useGlobalPipes(new ValidationPipe());
  SwaggerModule.setup('/api-docs', app, document, { useGlobalPrefix: true });

  const port = process.env.LOCATION_SERVICE_PORT ?? 3000;
  await app.listen(port, () => {
    console.log(
      `🚀 Application is running on: http://localhost:${port}/api-docs`,
    );
  });
}

bootstrap();
