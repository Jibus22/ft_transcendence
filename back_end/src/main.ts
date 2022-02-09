import { LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  let logger: LogLevel[];
  if (process.env.NODE_ENV === 'production' && process.env.VERBOSE !== 'true') {
    logger = ['log'];
  } else {
    logger = ['log', 'debug'];
  }

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  /**
   * Swagger Documentation settings
   * */

  const config = new DocumentBuilder()
    .setTitle('FT_Transcendence') //the title you want for your swagger docs
    .setDescription('FT_Transcendence API description') //description
    .setVersion('1.0') //version setting for the docs
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // api is the endpoint of documentation's website
  SwaggerModule.setup('api', app, document);

  /**
   * App listen port from the env, or defaults to 3000
   */
  app.enableCors({
    origin: [
      `http://${process.env.SERVER_IP}:${process.env.FRONT_PORT}`,
      'http://localhost:3001',
    ],
    credentials: true,
    exposedHeaders: ['secretKey', 'Completed-Auth'],
  });

  await app.listen(process.env.BACK_PORT || 3000);
}
bootstrap();
