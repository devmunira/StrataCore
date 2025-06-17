import { RequestHandler } from 'express';
import { ROUTE_KEY } from './decorators.keys';

export type HTTPMethods = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type RoutesMetaData = {
  method: HTTPMethods;
  path: string;
  middlewares: RequestHandler[];
  propertyName: string;
};

export function Routes(
  path: string,
  method: HTTPMethods,
  middlewares: RequestHandler[],
) {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const routes = Reflect.getMetadata(ROUTE_KEY, target) || [];

    routes.push({
      method,
      middlewares,
      path,
      propertyKey: propertyKey.toString(),
    });

    Reflect.defineMetadata(ROUTE_KEY, routes, target);
    return descriptor;
  };
}

export const Get = (path: string, middlewares: RequestHandler[] = []) =>
  Routes(path, 'get', middlewares);

export const Post = (path: string, middlewares: RequestHandler[] = []) =>
  Routes(path, 'post', middlewares);

export const Put = (path: string, middlewares: RequestHandler[] = []) =>
  Routes(path, 'put', middlewares);

export const Patch = (path: string, middlewares: RequestHandler[] = []) =>
  Routes(path, 'patch', middlewares);

export const Delete = (path: string, middlewares: RequestHandler[] = []) =>
  Routes(path, 'delete', middlewares);
