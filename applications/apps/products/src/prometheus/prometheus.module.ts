import { Module } from '@nestjs/common';
import { PrometheusController } from './prometheus.controller';
import { PrometheusService } from './prometheus.service';
import { MetricsProvider } from './metrics.provider';

@Module({
  controllers: [PrometheusController],
  providers: [...MetricsProvider],
  exports: [PrometheusService],
})
export class PrometheusModule {}
