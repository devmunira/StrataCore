import { FileLoggerOptions } from './../../config/app.config';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { ILoggerStrategy } from './ILogger.interface';
import { AppConfig } from '@/config/app.config';

const pipe = promisify(pipeline);

export class FileLogger implements ILoggerStrategy {
  private readonly logDir = path.resolve(__dirname, '../../../logs');
  private readonly archiveDir = path.join(this.logDir, 'archived');
  private readonly maxLines = 1000;
  private readonly retentionDays: number;
  private readonly zipInsteadOfDelete: boolean;
  private readonly options: FileLoggerOptions =
    AppConfig.getInstance().fileLogger;

  private currentDate: string;
  private currentFilePath: string;
  private lineCount: number;

  constructor() {
    this.retentionDays = this.options.retentionDays!;
    this.zipInsteadOfDelete = this.options.zipInsteadOfDelete!;

    fs.mkdirSync(this.archiveDir, { recursive: true });

    this.currentDate = this.getTodayDateString();
    this.currentFilePath = this.getLogFilePath(this.currentDate);
    this.lineCount = this.getInitialLineCount(this.currentFilePath);

    this.cleanupOldLogs();
  }

  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private getLogFilePath(date: string): string {
    return path.join(this.logDir, `log-${date}.log`);
  }

  private getInitialLineCount(filePath: string): number {
    if (!fs.existsSync(filePath)) return 0;
    return fs.readFileSync(filePath, 'utf8').split('\n').length - 1;
  }

  private rotateIfDateChanged() {
    const today = this.getTodayDateString();
    if (today !== this.currentDate) {
      this.currentDate = today;
      this.currentFilePath = this.getLogFilePath(today);
      this.lineCount = this.getInitialLineCount(this.currentFilePath);
    }
  }

  private rotateIfNeeded() {
    this.rotateIfDateChanged();

    if (this.lineCount >= this.maxLines) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.currentFilePath = path.join(
        this.logDir,
        `log-${this.currentDate}-${timestamp}.log`,
      );
      this.lineCount = 0;
    }
  }

  private writeToFile(content: string) {
    this.rotateIfNeeded();
    fs.appendFileSync(this.currentFilePath, content + '\n');
    this.lineCount++;
  }

  private async zipFile(filePath: string, date: string) {
    const zipPath = path.join(this.archiveDir, `log-${date}.log.gz`);
    const source = fs.createReadStream(filePath);
    const dest = fs.createWriteStream(zipPath);
    const gzip = zlib.createGzip();

    await pipe(source, gzip, dest);
    fs.unlinkSync(filePath);
  }

  private async cleanupOldLogs() {
    const now = Date.now();
    const files = fs.readdirSync(this.logDir);

    for (const file of files) {
      if (file === 'archived') continue;

      const fullPath = path.join(this.logDir, file);
      const stat = fs.statSync(fullPath);
      const age = (now - stat.mtime.getTime()) / (1000 * 60 * 60 * 24);

      if (age > this.retentionDays) {
        const dateMatch = file.match(/log-(\d{4}-\d{2}-\d{2})/);
        const dateStr = dateMatch?.[1] || this.getTodayDateString();

        try {
          if (this.zipInsteadOfDelete) {
            await this.zipFile(fullPath, dateStr);
          } else {
            fs.unlinkSync(fullPath);
          }
        } catch (err) {
          console.error(`Error during cleanup of ${file}:`, err);
        }
      }
    }
  }

  info(message: string, meta?: Record<string, any>) {
    const entry = `ℹ️ [INFO]-[${new Date().toISOString()}]: ${message} ${JSON.stringify(meta || {})}`;
    this.writeToFile(entry);
  }

  warn(message: string, meta?: Record<string, any>) {
    const entry = `⚠️ [WARN]-[${new Date().toISOString()}]: ${message} ${JSON.stringify(meta || {})}`;
    this.writeToFile(entry);
  }

  error(error: Error, meta?: Record<string, any>) {
    const entry = `⛔️ [ERROR]-[${new Date().toISOString()}]: ${error.name} - ${error.message}\nStack: ${error.stack}\n${JSON.stringify(meta || {})}`;
    this.writeToFile(entry);
  }

  debug(message: string, meta?: Record<string, any>): void {
    const entry = `🪲 [Debug]-[${new Date().toISOString()}]: ${message} ${JSON.stringify(meta || {})}`;
    this.writeToFile(entry);
  }
}
