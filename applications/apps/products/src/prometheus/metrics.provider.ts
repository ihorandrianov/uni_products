import { Provider } from '@nestjs/common';
import {
  Counter,
  Gauge,
  Histogram,
  Metric,
  Registry,
  Summary,
} from 'prom-client';
import { IMetric } from 'schemas/metric.schema';

const PRODUCT_METRICS: IMetric[] = [
  {
    kind: 'counter',
    config: {
      name: 'products_created_total',
      help: 'Total number of products created',
      labelNames: ['status'],
    },
  },
  {
    kind: 'counter',
    config: {
      name: 'products_deleted_total',
      help: 'Total number of products deleted',
      labelNames: ['status'],
    },
  },
];

export const MetricsProvider: Provider[] = [
  {
    provide: 'METRICS',
    useFactory: () => {
      return PRODUCT_METRICS.map((metric) => {
        switch (metric.kind) {
          case 'counter':
            return [metric.config.name, new Counter(metric.config)];
          case 'gauge':
            return [metric.config.name, new Gauge(metric.config)];
          case 'summary':
            return [metric.config.name, new Summary(metric.config)];
          case 'histogram':
            return [metric.config.name, new Histogram(metric.config)];
        }
      }) as [string, Metric][];
    },
  },
  {
    provide: Registry,
    useFactory: () => new Registry(),
  },
];
