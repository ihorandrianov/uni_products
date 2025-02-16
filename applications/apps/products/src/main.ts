import { NestFactory } from '@nestjs/core';
import { ProductsModule } from './products.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ProductsModule);
  const config = new DocumentBuilder()
    .setTitle('Products service')
    .setDescription('Service to add and see products')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  await app.listen(3000);
}
void bootstrap();
