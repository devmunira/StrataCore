import 'reflect-metadata';
import { Application, RequestHandler, Router } from 'express';
import { container } from 'tsyringe';
import { RoutesMetaData } from './routes.decorator';
import {
  CONTROLLER_KEY,
  CONTROLLER_MIDDLEWARE_KEY,
  MIDDLEWARE_KEY,
  ROUTE_KEY,
} from './decorators.keys';

type Constructor = new (...args: any[]) => {};

type ControllerMetadata = {
  basePath: string;
  routes: RoutesMetaData[];
  middlewares: RequestHandler[];
};

export function registerControllers(
  app: Application,
  controllers: Constructor[],
) {
  controllers.forEach((Controller) => {
    const controllerInstance = container.resolve(Controller);

    const controllerMetadata: ControllerMetadata = {
      basePath: Reflect.getMetadata(CONTROLLER_KEY, Controller),
      routes: Reflect.getMetadata(
        ROUTE_KEY,
        Controller.prototype,
      ) as RoutesMetaData[],
      middlewares:
        (Reflect.getMetadata(
          CONTROLLER_MIDDLEWARE_KEY,
          Controller,
        ) as RequestHandler[]) || [],
    };

    if (!controllerMetadata.basePath) {
      throw new Error(
        `[registerControllers] Base path is not defined for controller ${Controller.name}`,
      );
    }

    if (!controllerMetadata.routes.length) {
      throw new Error(
        `[registerControllers] No routes defined for controller ${Controller.name}`,
      );
    }

    const router = Router();

    // Apply controller level middlewares
    if (controllerMetadata.middlewares.length > 0) {
      router.use(controllerMetadata.middlewares);
      console.log('Controller middlewares applied');
    }

    // Handle individual routes
    controllerMetadata.routes.forEach((route) => {
      // check if the method exist in the controller instance
      if (!(route.propertyName in controllerInstance)) {
        throw new Error(
          `[registerControllers] Method ${route.propertyName} is not defined in controller ${Controller.name}`,
        );
      }

      const middlewares =
        Reflect.getMetadata(
          MIDDLEWARE_KEY,
          Controller.prototype,
          route.propertyName,
        ) || [];

      const handler = (controllerInstance as any)[route.propertyName].bind(
        controllerInstance,
      );
      router[route.method](route.path, [...middlewares, handler]);
    });

    app.use(controllerMetadata.basePath, router);
  });
}
