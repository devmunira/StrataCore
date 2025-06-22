import { createApp } from './app';
import { Logger } from './libs/logger/logger';
import { RegisterDependency } from './db/regsiter.db';
import http from 'http';

const port = process.env.PORT || 3000;
let server: http.Server;

async function main() {
  try {
    await RegisterDependency();
    const app = createApp();

    server = http.createServer(app);

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start the server', error);
    process.exit(1);
  }
}

main();
