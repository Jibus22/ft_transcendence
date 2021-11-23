import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UsersModule } from './module-users/users.module';
import { DevelopmentModule } from './module-development/development.module';

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
    // modules to be documented
    // include: [UsersModule]
  });
  // api is the endpoint of documentation's website
  SwaggerModule.setup('api', app, document);

  /**
   * App listen port from the env, or defaults to 3000
   */
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3001"); // TODO update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
