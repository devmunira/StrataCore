import express from 'express';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { UserController } from './user-module/User.controller';
import { registerControllers } from './libs/decorator/regsiter';

export const createApp = () => {
  const app = express();
  // Middleware
  app.use(express.json());
  dotenv.config();
  registerControllers(app, [UserController]);

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
