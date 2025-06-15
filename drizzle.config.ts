import { DatabaseConfig } from './src/libs/database/IDatabaseClient.interface';
import { AppConfig } from './src/config/app.config';
import { defineConfig } from 'drizzle-kit';

const config: DatabaseConfig = AppConfig.getInstance().database;

export default defineConfig({
  dialect: config.driver,
  out: `./src/db/migrations/${config.driver}`,
  schema: `./src/db/schemas/${config.driver}/schemas`,

  dbCredentials: {
    url: config.url,
    ssl: true,
  },
  verbose: true,
  strict: true,
});
