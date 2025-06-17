import { DatabaseConnectionPool } from '@/libs/database/DatabaseConnection.config';
import { DatabaseClientToken } from '@/libs/database/IDatabaseClient.interface';
import { ConsoleLogger } from '@/libs/logger/console.logger';
import { FileLogger } from '@/libs/logger/file-system.logger';
import { Logger } from '@/libs/logger/logger';
import { container } from 'tsyringe';

export async function RegisterDependency() {
  try {
    // Logger Register
    Logger.register(new ConsoleLogger(), new FileLogger());

    const DataBaseClient = new DatabaseConnectionPool();

    container.register(DatabaseClientToken, { useValue: DataBaseClient });

    await DataBaseClient.connect();
  } catch (error) {
    console.error('Failed to register dependencies', error);
    throw error;
  }
}
