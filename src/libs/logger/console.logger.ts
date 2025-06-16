// src/logger/strategies/ConsoleLogger.ts
import { ILoggerStrategy } from './ILogger.interface';
import colors from 'colors';

export class ConsoleLogger implements ILoggerStrategy {
  info(message: string, meta?: Record<string, any>) {
    console.info(
      `ℹ️  ${colors.cyan('[INFO]')}-[${new Date().toISOString()}]: ${message}`,
      meta || '',
    );
  }

  warn(message: string, meta?: Record<string, any>) {
    console.warn(
      `⚠️  ${colors.yellow('[WARN]')}-[${new Date().toISOString()}]: ${message}`,
      meta || '',
    );
  }

  error(error: Error, meta?: Record<string, any>) {
    console.error(
      `⛔️  ${colors.red('[ERROR]')}-[${new Date().toISOString()}]: ${error.name} - ${error.message}`,
      {
        stack: error.stack,
        ...meta,
      },
    );
  }

  debug(message: string, meta?: Record<string, any>): void {
    console.log(
      `🪲  ${colors.green('[DEBUG]')}-[${new Date().toISOString()}]: ${message}`,
      meta || '',
    );
  }
}
