import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  app.use(helmet()); 
  app.use(compression());
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    skipMissingProperties: true,
    forbidNonWhitelisted: false,
  }));
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('QuickNotes API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token (without "Bearer " prefix)',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('Authentication', 'User registration and login endpoints')
    .addTag('Notes', 'CRUD operations for managing notes')
    .addTag('Health', 'System health and monitoring endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}`);
  Logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();