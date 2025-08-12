import { NestFactory } from '@nestjs/core';
import { AppModule } from './main.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // RabbitMQ
  // const configService = app.get(ConfigService);
  // const sharedService = app.get(SharedService);

  // const queue = configService.get('RABBITMQ_AUTH_QUEUE');

  // app.connectMicroservice(sharedService.getRmqOptions(queue));

  const config = new DocumentBuilder()
    .setTitle(process.env.APP_NAME)
    .addServer('/api/user')
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
  app.setGlobalPrefix('/api/user');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  SwaggerModule.setup('/api-docs', app, document, { useGlobalPrefix: true });
  const port = process.env.USER_SERVICE_PORT ?? 3000;
  app.listen(port, () => {
    console.log(
      `🚀 Application is running on: http://localhost:${port}/api-docs`,
    );
  });
}

bootstrap();
