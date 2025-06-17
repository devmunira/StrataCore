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
import { PostgresDriver } from './Driver/PostgresqlDatabase.driver';
import { MySQLDriver } from './Driver/MysqlDatabase.driver';
import { Logger } from '../logger/logger';

export class DatabaseConnectionPool implements IDatabaseClient {
  private connected = false;
  private config: DatabaseConfig = AppConfig.getInstance().database;
  private pool?: Pool | MysqlPool;
  private databaseDriver: IDatabaseDriver;

  constructor() {
    this.databaseDriver =
      this.config.driver === DatabaseDriver.POSTGRESQL
        ? new PostgresDriver()
        : new MySQLDriver();
  }

  async connect() {
    if (this.connected) return;

    try {
      if (this.config.driver === DatabaseDriver.POSTGRESQL) {
        this.pool = (await this.databaseDriver.createPool()) as Pool;
      } else {
        this.pool = (await this.databaseDriver.createPool()) as MysqlPool;
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
    await this.pool.end();
    this.connected = false;
    console.log('Database disconnected');
  }

  isConnected() {
    return this.connected;
  }

  getClient(): DrizzleClient {
    if (!this.connected || !this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }
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
      Logger.info(`[${logLabel}] completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      Logger.info(`[${logLabel}] failed in ${duration.toFixed(2)}ms`);
      console.error(error);
      throw new Error(`[${logLabel}] Database query failed`);
    }
  }
}
