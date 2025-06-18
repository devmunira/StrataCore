import 'reflect-metadata';

export function TryCatch() {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        console.error(
          `Caught error on ${target.name} in ${propertyKey.toString()}:`,
          error,
        );

        // Check if we're in an Express context (has res object)
        const res = args.find((arg) => arg && typeof arg.json === 'function');
        if (res) {
          return res.status(500).json({
            message: 'Internal server error',
            error:
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred',
          });
        }

        // If not in Express context, re-throw
        throw error;
      }
    };

    return descriptor;
  };
}
