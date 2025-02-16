import { z } from 'zod';
import { CollectFunction, Gauge } from 'prom-client';

const BASE_CONFIG_SCHEMA = z.object({
  name: z.string(),
  help: z.string(),
  labelNames: z.array(z.string()).optional(),
});

const isCollectFunction = (
  func: any,
): func is CollectFunction<Gauge<string>> => {
  return typeof func === 'function';
};

export const METRIC_SCHEMA = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('counter'),
    config: BASE_CONFIG_SCHEMA,
  }),
  z.object({
    kind: z.literal('gauge'),
    config: BASE_CONFIG_SCHEMA.extend({
      collect: z
        .custom<CollectFunction<Gauge<string>>>(isCollectFunction)
        .optional(),
    }),
  }),
  z.object({
    kind: z.literal('histogram'),
    config: BASE_CONFIG_SCHEMA.extend({
      buckets: z.array(z.number()).optional(),
    }),
  }),
  z.object({
    kind: z.literal('summary'),
    config: BASE_CONFIG_SCHEMA.extend({
      percentiles: z.array(z.number()).optional(),
      maxAgeSeconds: z.number().optional(),
      ageBuckets: z.number().optional(),
    }),
  }),
]);

export type IMetric = z.infer<typeof METRIC_SCHEMA>;
