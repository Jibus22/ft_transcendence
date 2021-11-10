import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UsersModule } from './users/users.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Swagger Documentation settings
   * */

  const config = new DocumentBuilder()
    .setTitle('FT_Transcendence') //the title you want for your swagger docs
    .setDescription('FT_Transcendence API description') //description
    .setVersion('1.0') //version setting for the docs
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [UsersModule],
    // modules to be documented
  });
  SwaggerModule.setup('api', app, document);
  // api is the endpoint of documentation's website

  /**
   * App listen port from the env, or defaults to 3000
   */
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
