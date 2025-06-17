import { Logger } from '../logger/Logger';

export function Dto(schemas: any) {
  return function (target: any, propertyKey: string | symbol) {
    let schema: any;
    Object.defineProperty(target, propertyKey, {
      get() {
        return schema;
      },
      set(data: any) {
        const parsedQuery = schemas.safeParse(data);
        if (!parsedQuery.success) {
          Logger.error(`Invalid query for ${propertyKey.toString()}`);
          throw new Error(`Invalid query for ${propertyKey.toString()}`);
        }
        schema = data;
      },
    });
  };
}
