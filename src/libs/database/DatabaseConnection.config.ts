import {
  DatabaseConfig,
  DatabaseDriver,
  DrizzleClient,
  IDatabaseClient,
  IDatabaseDriver,
} from './IDatabaseClient.interface';
import { Pool } from 'pg';
import { AppConfig } from '@/config/app.config';
import { Pool as MysqlPool } from 'mysql2/promise';

export class DatabaseConnectionPool implements IDatabaseClient {
  private connected = false;
  private config: DatabaseConfig = AppConfig.getInstance().database;
  private pool?: Pool | MysqlPool;
  constructor(private databaseDriver: IDatabaseDriver) {}

  async connect() {
    if (this.connected) return;

    try {
      if (this.config.driver === DatabaseDriver.POSTGRESQL) {
        this.pool = (await this.databaseDriver.createPool()) as Pool;
      } else {
        this.pool = (await this.databaseDriver.createPool()) as MysqlPool;
        const conn = await this.pool.getConnection();
        conn.release();
      }

      this.connected = true;
      console.log(
        `✅ ${this.config.driver.toLocaleUpperCase()} Database Connected`,
      );
    } catch (err) {
      console.error('Database connection failed:', err);
      throw err;
    }
  }

  async disconnect() {
    if (!this.connected || !this.pool) return;

    if (this.config.driver === DatabaseDriver.POSTGRESQL) {
      await (this.pool as Pool).end();
    } else {
      await (this.pool as MysqlPool).end();
    }

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
