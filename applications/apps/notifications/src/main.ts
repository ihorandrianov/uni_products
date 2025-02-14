import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { NotificationsModule } from './notifications.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(NotificationsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
