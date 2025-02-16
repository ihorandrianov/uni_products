import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';
import { EnvConfig } from 'schemas/env.schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private client: PoolClient;

  constructor(private configService: ConfigService<EnvConfig, true>) {
    this.pool = new Pool({
      user: this.configService.get('DB_USER'),
      host: this.configService.get('DB_HOST'),
      database: this.configService.get('DB_NAME'),
      password: this.configService.get('DB_PASSWORD'),
      port: this.configService.get('DB_PORT'),
    });
  }

  async onModuleInit() {
    this.client = await this.pool.connect();
  }

  async onModuleDestroy() {
    this.client?.release();
    await this.pool?.end();
  }

  async query(text: string, params?: any[]) {
    try {
      return await this.client.query(text, params);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Database query error: ${error.message}`);
      }
    }
  }
}
