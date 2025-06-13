// MySQLDriver.ts
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import {
  DatabaseConfig,
  IDatabaseDriver,
  MysqlDrizzleClient,
} from '@/libs/database/IDatabaseClient.interface';
import { AppConfig } from '@/config/app.config';

export class MySQLDriver implements IDatabaseDriver {
  private connectionPool: any;
  private readonly config: DatabaseConfig = AppConfig.getInstance().database;

  async createPool() {
    this.connectionPool = await mysql.createPool({
      uri: this.config.url,
      connectionLimit: this.config.maxConnection,
    });
    return this.connectionPool;
  }

  createDrizzle(): MysqlDrizzleClient {
    return drizzle(this.connectionPool);
  }
}
