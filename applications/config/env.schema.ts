import z from 'Zod';

export const envSchema = z.object({
  AWS_REGION: z.string(),
  SQS_QUEUE_URL: z.string().url(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  SQS_MAX_MESSAGES: z
    .string()
    .transform((val): number => Number(val))
    .pipe(z.number().min(1).max(10))
    .optional()
    .default('10'),
  SQS_WAIT_TIME: z
    .string()
    .transform((val): number => Number(val))
    .pipe(z.number().min(0).max(20))
    .optional()
    .default('20'),
});

export type Env = z.infer<typeof envSchema>;
