import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('CV & JD Parser API')
    .setDescription('API for CV parsing and job description analysis')
    .setVersion('1.0')
    .addTag('cv-parser', 'CV parsing operations')
    .addTag('jd-parser', 'Job description parsing operations')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
