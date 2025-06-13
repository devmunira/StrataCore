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
  private connectionPool: any;
  private readonly config: DatabaseConfig = AppConfig.getInstance().database;

  async createPool() {
    this.connectionPool = new Pool({
      connectionString: this.config.url,
      max: this.config.maxConnection,
      idleTimeoutMillis: this.config.idleTimeout,
      connectionTimeoutMillis: this.config.connectionTimeout,
      maxUses: this.config.maxUses,
      ssl: this.config.ssl,
    });
    return this.connectionPool;
  }

  createDrizzle(): PostgresDrizzleClient {
    return drizzle({ client: this.connectionPool, schema });
  }
}
