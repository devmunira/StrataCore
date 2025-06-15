// PostgresSQLDriver.ts

import {
  DatabaseConfig,
  IDatabaseDriver,
  PostgresDrizzleClient,
} from '@/libs/database/IDatabaseClient.interface';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schemas/postgres/schemas';
import { AppConfig } from '@/config/app.config';

export class PostgresDriver implements IDatabaseDriver {
  private connectionPool?: Pool;
  private readonly config: DatabaseConfig = AppConfig.getInstance().database;

  async createPool(): Promise<Pool> {
    if (this.connectionPool) return this.connectionPool;

    const pool = new Pool({
      connectionString: this.config.url,
      max: this.config.maxConnection,
      idleTimeoutMillis: this.config.idleTimeout,
      connectionTimeoutMillis: this.config.connectionTimeout,
      maxUses: this.config.maxUses,
      ssl: this.config.ssl,
    });

    this.connectionPool = pool;
    return this.connectionPool;
  }

  createDrizzle(): PostgresDrizzleClient {
    if (!this.connectionPool) {
      throw new Error('Pool not initialized. Call createPool() first.');
    }
    return drizzle({ client: this.connectionPool, schema });
  }
}
