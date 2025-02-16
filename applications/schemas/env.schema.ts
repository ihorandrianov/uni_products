import { z } from 'zod';

export const ENV_SCHEMA = z.object({
  AWS_REGION: z.string().trim().min(1),
  AWS_ACCESS_KEY_ID: z.string().trim().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().trim().min(1),
  AWS_SESSION_TOKEN: z.string().trim().min(1),
  SQS_QUEUE_URL: z.string().trim().url(),
  DB_USER: z.string().trim().min(1),
  DB_HOST: z.string().trim().min(1),
  DB_NAME: z.string().trim().min(1),
  DB_PASSWORD: z.string().trim().min(1),
  DB_PORT: z
    .string()
    .default('5432')
    .refine(parseInt)
    .transform((num) => parseInt(num)),
  LOCALSTACK_ENDPOINT: z.string(),
});

export type EnvConfig = z.infer<typeof ENV_SCHEMA>;
