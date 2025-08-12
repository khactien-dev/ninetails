import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(MainModule);

  const config = new DocumentBuilder()
    .setTitle(process.env.APP_NAME)
    .addServer('/api/form-request')
    .setDescription(`The ${process.env.APP_NAME} description`)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.enableCors({
    origin: '*',
  });
  app.setGlobalPrefix('/api/form-request');
  app.useGlobalPipes(new ValidationPipe());
  SwaggerModule.setup('/api-docs', app, document, { useGlobalPrefix: true });

  const port = process.env.FORM_SERVICE_PORT ?? 3000;
  app.listen(port, () => {
    console.log(
      `🚀 Application is running on: http://localhost:${port}/api-docs`,
    );
  });
}

bootstrap();
