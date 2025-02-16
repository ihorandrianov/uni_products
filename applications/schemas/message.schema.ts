import z from 'Zod';

const MESSAGE_DATA_SCHEMA = z.object({
  id: z.number().positive(),
  name: z.string().min(1).max(20),
  description: z.string().min(1).max(500),
});

export const MESSAGE_BODY_SCHEMA = z.object({
  action: z.string(),
  data: MESSAGE_DATA_SCHEMA,
});

export type MessageData = z.infer<typeof MESSAGE_DATA_SCHEMA>;

export const parseBody = (body: string) => {
  const toJson: unknown = JSON.parse(body);
  const parsedBody = MESSAGE_BODY_SCHEMA.parse(toJson);
  return parsedBody;
};
