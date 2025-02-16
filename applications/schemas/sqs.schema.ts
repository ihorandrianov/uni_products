import { z } from 'zod';
import { PRODUCT_SCHEMA } from './product.schema';

export const SQS_PAYLOAD_SCHEMA = z.object({
  pattern: z.enum(['create', 'delete']),
  data: PRODUCT_SCHEMA,
});

export type SqsPayload = z.infer<typeof SQS_PAYLOAD_SCHEMA>;
