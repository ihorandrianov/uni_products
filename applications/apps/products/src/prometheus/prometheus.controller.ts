// prometheus.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';
import { Response } from 'express';

@Controller('metrics')
export class PrometheusController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  async getMetrics(@Res() response: Response) {
    const { metrics, contentType } = await this.prometheusService.getMetrics();

    response.setHeader('Content-Type', contentType);

    return response.send(metrics);
  }
}
