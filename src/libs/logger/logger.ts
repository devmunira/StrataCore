import { isError } from '@/utils/error';
import { ILoggerStrategy } from './ILogger.interface';

export class Logger {
  private static strategies: ILoggerStrategy[] = [];

  /**
   * Register one or more logger strategies
   */
  static register(...strategies: ILoggerStrategy[]) {
    this.strategies.push(...strategies);
  }

  /**
   * Reset registered loggers
   */
  static reset() {
    this.strategies = [];
  }

  static info(message: string, meta?: Record<string, any>) {
    for (const strategy of this.strategies) {
      strategy.info(message, meta);
    }
  }

  static warn(message: string, meta?: Record<string, any>) {
    for (const strategy of this.strategies) {
      strategy.warn(message, meta);
    }
  }

  static error(errorOrMessage: Error | string, meta?: Record<string, any>) {
    const error = isError(errorOrMessage)
      ? errorOrMessage
      : new Error(errorOrMessage);

    for (const strategy of this.strategies) {
      strategy.error(error, meta);
    }
  }

  static debug(message: string, meta?: Record<string, any>) {
    for (const strategy of this.strategies) {
      strategy.debug(message, meta);
    }
  }
}
