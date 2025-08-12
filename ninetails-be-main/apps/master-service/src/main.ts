import { NestFactory } from '@nestjs/core';
import { MasterServiceModule } from './master-service.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(MasterServiceModule);
  const config = new DocumentBuilder()
    .setTitle(process.env.APP_NAME)
    .setDescription(`The ${process.env.APP_NAME} description`)
    .addServer('/api/auth')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.enableCors({
    origin: '*',
  });
  app.setGlobalPrefix('/api/auth');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // app.setGlobalPrefix(process.env.GLOBAL_PREFIX);
  SwaggerModule.setup('/api-docs', app, document, { useGlobalPrefix: true });
  const port = process.env.MASTER_SERVICE_PORT ?? 3000;
  app.listen(port, () => {
    console.log(
      `🚀 Application master is running on: http://localhost:${port}/api-docs`,
    );
  });
}
bootstrap();
