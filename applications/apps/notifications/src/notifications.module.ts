import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { ENV_SCHEMA, EnvConfig } from 'schemas/env.schema';

@Module({
  imports: [
    ConfigModule.forRoot<EnvConfig>({
      validate: (config: Record<string, unknown>) => {
        const result = ENV_SCHEMA.safeParse(config);
        if (!result.success) {
          const formatted = result.error.format();
          throw new Error(JSON.stringify(formatted, null, 2));
        }
        return result.data;
      },
    }),
  ],
  controllers: [NotificationsController],
  providers: [],
})
export class NotificationsModule {}
