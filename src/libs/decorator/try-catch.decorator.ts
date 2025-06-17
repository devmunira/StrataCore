export function TryCatch() {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(...args);
      } catch (error) {
        console.error(
          `Caught error on ${target.name} in ${propertyKey.toString()}:`,
          error,
        );
        throw error;
      }
    };

    return descriptor;
  };
}
