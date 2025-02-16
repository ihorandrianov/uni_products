import { NestFactory } from '@nestjs/core';
import { NotificationsModule } from './notifications.module';
import { SqsServer } from './sqs.server';
import { SQS } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'schemas/env.schema';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);
  const configService = app.get(ConfigService<EnvConfig, true>);
  const sqsClient = new SQS({
    endpoint: configService.get('LOCALSTACK_ENDPOINT'),
    region: configService.get('AWS_REGION'),
    credentials: {
      accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      sessionToken: configService.get('AWS_SESSION_TOKEN'),
    },
  });
  app.connectMicroservice({
    strategy: new SqsServer(sqsClient, configService.get('SQS_QUEUE_URL')),
  });
  await app.startAllMicroservices();
}

void bootstrap();
