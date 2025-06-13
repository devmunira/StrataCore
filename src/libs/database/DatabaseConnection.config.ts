import { drizzle } from 'drizzle-orm/node-postgres';
import {
  DatabaseConfig,
  DrizzleClient,
  IDatabaseClient,
  IDatabaseDriver,
} from './IDatabaseClient.interface';
import { Pool } from 'pg';
import { AppConfig } from '@/config/app.config';

export class DatabaseConnectionPool implements IDatabaseClient {
  private connected = false;
  constructor(private databaseDriver: IDatabaseDriver) {}

  async connect() {
    if (this.connected) return;

    (this.databaseDriver.createPool() as Pool).connect();

    this.connected = true;
    console.log('Database Connected');
  }

  async disconnect() {
    if (!this.connected) return;

    await this.pool.end();
    this.connected = false;
    console.log('Database disconnected');
  }

  isConnected() {
    return this.connected;
  }

  getClient(): DrizzleClient {
    return this.databaseDriver.createDrizzle();
  }

  async executeQuery<T>(
    logLabel: string,
    queryFunc: (db: DrizzleClient) => Promise<T>,
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await queryFunc(this.getClient());
      const duration = performance.now() - start;

      console.log(`[${logLabel}] completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`[${logLabel}] failed in ${duration.toFixed(2)}ms`);

      console.log(error);
      throw new Error(`[${logLabel}] Database query failed`);
    }
  }
}
