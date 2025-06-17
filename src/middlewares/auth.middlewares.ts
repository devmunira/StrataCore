import { NextFunction, Request, Response } from 'express';

export function AuthGuard(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  console.log('Auth Middleware: I am calling from auth guard');
  next();
}
