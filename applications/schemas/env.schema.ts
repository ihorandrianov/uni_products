import z from 'Zod';

export const ENV_SCHEMA = z.object({
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_SESSION_TOKEN: z.string().min(1),
  SQS_QUEUE_URL: z.string().url(),
  DB_USER: z.string(),
  DB_HOST: z.string(),
  DB_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z.number(),
});

export type EnvConfig = z.infer<typeof ENV_SCHEMA>;
