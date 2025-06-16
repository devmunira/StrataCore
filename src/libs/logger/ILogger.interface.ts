export interface ILoggerStrategy {
  info(message: string, metaData?: { [key: string]: any }): void;
  warn(message: string, metaData?: { [key: string]: any }): void;
  error(message: Error, metaData?: { [key: string]: any }): void;
  debug(message: string, metaData?: { [key: string]: any }): void;
}
