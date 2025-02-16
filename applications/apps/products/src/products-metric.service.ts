import { Injectable } from '@nestjs/common';
import { PrometheusService } from './prometheus/prometheus.service';

@Injectable()
export class ProductMetricsService {
  constructor(private readonly prometheusService: PrometheusService) {}

  private readonly METRIC_NAMES = {
    created: 'products_created_total',
    deleted: 'products_deleted_total',
  } as const;

  incrementCreated(status: 'success' | 'failure') {
    this.prometheusService.incrementMetric(this.METRIC_NAMES.created, {
      status,
    });
  }

  incrementDeleted(status: 'success' | 'failure') {
    this.prometheusService.incrementMetric(this.METRIC_NAMES.deleted, {
      status,
    });
  }
}
