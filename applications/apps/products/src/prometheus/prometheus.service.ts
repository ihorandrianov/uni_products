import { Injectable, Inject } from '@nestjs/common';
import { Metric, Registry, Counter } from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly metricMap: Map<string, Metric>;

  constructor(
    private readonly registry: Registry,
    @Inject('METRICS') private readonly metrics: [string, Metric][],
  ) {
    this.metricMap = new Map(metrics);
    // eslint-disable-next-line
    for (const [_, metric] of metrics) {
      this.registry.registerMetric(metric);
    }
  }

  incrementMetric(name: string, labels: Record<string, string> = {}) {
    const metric = this.metricMap.get(name);
    // other metrics not yet implemented
    if (metric && metric instanceof Counter) {
      metric.labels(labels).inc();
    }
  }

  async getMetrics(): Promise<{
    metrics: string;
    contentType: string;
  }> {
    const metrics = await this.registry.metrics();
    return {
      metrics,
      contentType: this.registry.contentType,
    };
  }
}
