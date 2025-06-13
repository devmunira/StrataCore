// AppConfig.ts

import {
  DatabaseConfig,
  DatabaseDriver,
} from '@/libs/database/IDatabaseClient.interface';

interface IAppConfig {
  database: DatabaseConfig;
}

export class AppConfig {
  private static instance: AppConfig;
  private readonly options: IAppConfig;

  // Prevent direct instantiation
  private constructor() {
    this.options = this.loadConfiguration();
  }

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  private loadConfiguration(): IAppConfig {
    return {
      database: {
        url: this.getRequiredEnvVar('DATABASE_URL'),
        maxConnection: this.parseIntEnv('DATABASE_MAX_CONNECTION', 10),
        idleTimeout: this.parseIntEnv('DATABASE_IDLE_TIMEOUT', 10000),
        connectionTimeout: this.parseIntEnv(
          'DATABASE_CONNECTION_TIMEOUT',
          10000,
        ),
        maxUses: this.parseIntEnv('MAXUSES', 10),
        ssl: this.parseBooleanEnv('SSL', false),
        driver: this.getRequiredEnvVar(
          'DATABASE_DRIVER',
        ) as unknown as DatabaseDriver,
      },
    };
  }

  private getRequiredEnvVar(key: string): string {
    const val = process.env[key];
    if (!val) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return val;
  }

  private getOptionalEnvVar(key: string): string | undefined {
    return process.env[key];
  }

  private parseIntEnv(key: string, defaultValue: number): number {
    const val = process.env[key];
    const parsed = val ? parseInt(val, 10) : defaultValue;
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${key} is not a valid number`);
    }
    return parsed;
  }

  private parseBooleanEnv(key: string, defaultValue: boolean): boolean {
    const val = process.env[key];
    if (val === undefined) return defaultValue;
    return ['true', '1', 'yes'].includes(val.toLowerCase());
  }

  get database(): DatabaseConfig {
    return this.options.database;
  }
}
