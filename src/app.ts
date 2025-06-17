import express from 'express';
import { registerControllers } from './libs/decorator/auth.decorator';

export const createApp = () => {
  const app = express();
  // Middleware
  app.use(express.json());

  registerControllers(app, []);

  // Error handling middleware
  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Something went wrong!' });
    },
  );

  return app;
};
