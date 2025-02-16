import { z } from 'zod';
import { PRODUCT_SCHEMA } from './product.schema';

export const MESSAGE_BODY_SCHEMA = z.object({
  action: z.string(),
  product: PRODUCT_SCHEMA,
});

export const parseBody = (body: string) => {
  const toJson: unknown = JSON.parse(body);
  const parsedBody = MESSAGE_BODY_SCHEMA.parse(toJson);
  return parsedBody;
};
