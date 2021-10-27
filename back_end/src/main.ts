import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';

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
    include: [UsersModule, ReportsModule], //the modules that you want to include in your swagger docs
  });
  SwaggerModule.setup('api', app, document); // if you want your docs to open up at a different endpoint, you can replace 'api' with endpoint of your choice

  /**
   * App listen port from the env, or defaults to
   */
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
