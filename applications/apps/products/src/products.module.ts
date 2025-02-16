import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV_SCHEMA, EnvConfig } from 'schemas/env.schema';
import { DatabaseService } from './database.service';
import { AwsSqsClient } from 'clients/aws-sqs.client';
import { SQS } from '@aws-sdk/client-sqs';
import { NotifyService } from './notify.service';
import { PrometheusService } from './prometheus/prometheus.service';
import { ProductMetricsService } from './products-metric.service';

@Module({
  imports: [
    ConfigModule.forRoot<EnvConfig>({
      validate: (config: Record<string, unknown>) => {
        const result = ENV_SCHEMA.safeParse(config);
        if (!result.success) {
          const formatted = result.error.format();
          throw new Error(JSON.stringify(formatted, null, 2));
        }
        return result.data;
      },
      isGlobal: true,
    }),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    DatabaseService,
    {
      provide: AwsSqsClient,
      useFactory: (configService: ConfigService<EnvConfig, true>) => {
        const sqs = new SQS({
          region: configService.get('AWS_REGION'), // Use AWS region from environment or default to 'us-east-1'
          credentials: {
            accessKeyId: configService.get('AWS_ACCESS_KEY_ID'), // Replace with your access key ID
            secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'), // Replace with your secret access key
            sessionToken: configService.get('AWS_SESSION_TOKEN'), // Replace with your session token
          },
        });
        return new AwsSqsClient(sqs, configService.get('SQS_QUEUE_URL'));
      },
    },
    NotifyService,
    PrometheusService,
    ProductMetricsService,
  ],
})
export class ProductsModule {}
