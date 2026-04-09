type Handler = (
  req: Record<string, unknown>,
  res: Record<string, unknown>,
  next: (error?: unknown) => void
) => unknown;

type RouterLayer = {
  route?: {
    path?: unknown;
    methods?: Partial<Record<"get" | "post" | "put" | "delete", unknown>>;
    stack?: Array<{ handle: unknown }>;
  };
};

type RouterLike = {
  stack?: RouterLayer[];
};

export const getRouteHandlers = (
  router: RouterLike,
  method: "get" | "post" | "put" | "delete",
  path: string
): Handler[] => {
  const layer = router.stack?.find(
    (item) => item.route?.path === path && item.route.methods?.[method]
  );

  if (!layer?.route?.stack) {
    throw new Error(`Route not found: ${method.toUpperCase()} ${path}`);
  }

  return layer.route.stack.map((stackItem) => stackItem.handle as Handler);
};

export const createMockContext = (overrides?: {
  body?: Record<string, unknown>;
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  auth?: Record<string, unknown>;
}) => {
  const req = {
    body: overrides?.body ?? {},
    params: overrides?.params ?? {},
    query: overrides?.query ?? {},
    headers: overrides?.headers ?? {},
    auth: overrides?.auth,
    ip: "127.0.0.1",
    path: "/",
    baseUrl: "/",
    method: "GET",
    socket: {
      remoteAddress: "127.0.0.1"
    }
  };

  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    setHeader(key: string, value: string) {
      this.headers[key] = value;
    }
  };

  return { req, res };
};

export const runHandlers = async (
  handlers: Handler[],
  req: Record<string, unknown>,
  res: Record<string, unknown>
) => {
  await new Promise<void>((resolve, reject) => {
    let index = 0;

    const next = (error?: unknown) => {
      if (error) {
        reject(error);
        return;
      }

      const handler = handlers[index++];

      if (!handler) {
        resolve();
        return;
      }

      try {
        const result = handler(req, res, next);

        if (index === handlers.length) {
          Promise.resolve(result)
            .then(() => setTimeout(resolve, 0))
            .catch(reject);
        } else if (result && typeof (result as Promise<unknown>).then === "function") {
          (result as Promise<unknown>).catch(reject);
        }
      } catch (error_) {
        reject(error_);
      }
    };

    next();
  });
};
