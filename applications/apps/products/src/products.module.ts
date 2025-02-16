import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV_SCHEMA, EnvConfig } from 'schemas/env.schema';
import { DatabaseService } from './database.service';
import { AwsSqsClient } from 'clients/aws-sqs.client';
import { SQS } from '@aws-sdk/client-sqs';
import { NotifyService } from './notify.service';
import { ProductMetricsService } from './products-metric.service';
import { PrometheusModule } from './prometheus/prometheus.module';
import { PrometheusController } from './prometheus/prometheus.controller';
import { ProductsRepository } from './products.repository';

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
    PrometheusModule,
  ],
  controllers: [ProductsController, PrometheusController],
  providers: [
    ProductsService,
    DatabaseService,
    {
      provide: AwsSqsClient,
      useFactory: (configService: ConfigService<EnvConfig, true>) => {
        const sqs = new SQS({
          endpoint: configService.get('LOCALSTACK_ENDPOINT'),
          region: configService.get('AWS_REGION'),
          credentials: {
            accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
            sessionToken: configService.get('AWS_SESSION_TOKEN'),
          },
        });
        return new AwsSqsClient(sqs, configService.get('SQS_QUEUE_URL'));
      },
      inject: [ConfigService],
    },
    NotifyService,
    ProductMetricsService,
    ProductsRepository,
  ],
})
export class ProductsModule {}
