import { RequestHandler } from 'express';
import 'reflect-metadata';
import { CONTROLLER_MIDDLEWARE_KEY, MIDDLEWARE_KEY } from './decorators.keys';

export function Guard(middlewares: RequestHandler | RequestHandler[]) {
  return function (target: any, propertyKey?: string | symbol) {
    const middlewaresArray = Array.isArray(middlewares)
      ? middlewares
      : [middlewares];

    if (propertyKey && typeof propertyKey === 'string') {
      // method level
      const existingMiddlewares =
        Reflect.getMetadata(MIDDLEWARE_KEY, target, propertyKey) || [];

      Reflect.defineMetadata(
        MIDDLEWARE_KEY,
        [...existingMiddlewares, ...middlewaresArray],
        target,
        propertyKey,
      );
      return;
    }

    // class level middlewares
    const existingMiddlewares =
      Reflect.getMetadata(CONTROLLER_MIDDLEWARE_KEY, target) || [];
    Reflect.defineMetadata(
      CONTROLLER_MIDDLEWARE_KEY,
      [...existingMiddlewares, ...middlewaresArray],
      target,
    );
  };
}
