import app from './app';
import { DatabaseConnectionPool } from './libs/database/DatabaseConnection.config';
import { MySQLDriver } from './libs/database/Driver/MysqlDatabase.driver';

const PORT = process.env.PORT || 4000;

const db = new DatabaseConnectionPool(new MySQLDriver()).connect();

console.log({ db });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
