import { drizzle } from 'drizzle-orm/node-postgres';
import * as postgresSchema from '@/db/schemas/postgres/schemas';
import * as mysqlSchema from '@/db/schemas/mysql/schemas';
import { drizzle as MysqlDrizzle } from 'drizzle-orm/mysql2';
import { Pool } from 'pg';
import type { Pool as MysqlPool } from 'mysql2/promise';

export type PostgresDrizzleClient = ReturnType<
  typeof drizzle<typeof postgresSchema>
>;
export type MysqlDrizzleClient = ReturnType<
  typeof MysqlDrizzle<typeof mysqlSchema>
>;

export type DrizzleClient = MysqlDrizzleClient | PostgresDrizzleClient;

// Need an interface for database connection
export interface IDatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getClient(): DrizzleClient;
  isConnected(): boolean;
  executeQuery<T>(
    logLevel: string,
    queryFunc: (db: DrizzleClient) => Promise<T>,
  ): Promise<T>;
}

// Available Database Driver on System
export enum DatabaseDriver {
  MYSQL = 'mysql',
  POSTGRESQL = 'postgres',
}

// Database Configurations
export type DatabaseConfig = {
  url: string;
  maxConnection?: number;
  idleTimeout?: number;
  connectionTimeout?: number;
  maxUses?: number;
  ssl?: boolean;
  driver: DatabaseDriver;
};

// Create interface for Database driver
export interface IDatabaseDriver {
  createPool(): Promise<Pool | MysqlPool>;
  createDrizzle(): DrizzleClient;
}
