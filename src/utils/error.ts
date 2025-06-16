import { Logger } from '@/libs/logger/Logger';

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function safeAsync(fn: (...args: any[]) => Promise<any>) {
  return async function (...args: any[]) {
    try {
      return await fn(...args);
    } catch (error) {
      throw error;
    }
  };
}
