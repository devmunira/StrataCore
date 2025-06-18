import express, {
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from 'express';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { UserController } from './mysql-demo-module/User.controller';
import { registerControllers } from './libs/decorator/regsiter';
import { ZodError } from 'zod';

export const createApp = () => {
  const app = express();
  // Middleware
  app.use(express.json());
  dotenv.config();
  registerControllers(app, [UserController]);

  // Error handling middleware - must be last
  const errorHandler: ErrorRequestHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    res.status(500).json({ message: 'Something went wrong!', err });
  };

  // app.use(errorHandler);

  return app;
};
