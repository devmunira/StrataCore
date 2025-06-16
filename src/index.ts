import { PostgresDriver } from './libs/database/Driver/PostgresqlDatabase.driver';
import app from './app';
import { DatabaseConnectionPool } from './libs/database/DatabaseConnection.config';
import { MySQLDriver } from './libs/database/Driver/MysqlDatabase.driver';
import { ConsoleLogger } from './libs/logger/console.logger';
import { FileLogger } from './libs/logger/file-system.logger';
import { Logger } from './libs/logger/Logger';

const PORT = process.env.PORT || 4000;

Logger.register(new ConsoleLogger(), new FileLogger());
new DatabaseConnectionPool().connect();

app.listen(PORT, () => {
  Logger.info(`Server running on port ${PORT}`);
});
