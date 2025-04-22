import fs from 'fs';
import path from 'path';

import type { Express, Request, Handler as ExpressHandler, ErrorRequestHandler } from 'express';

type RouteLoaderParams = {
  dir: string;
};

export class AppError extends Error {
  constructor(
    private status: number,
    message: string,
  ) {
    super(message);
  }

  getStatus(): number {
    return this.status;
  }
}

export class SuccessResponse {
  constructor(public data: any) {}
}

export type Handler = (req: Request) => Promise<SuccessResponse> | SuccessResponse;

const wrapper =
  (handler: Handler): ExpressHandler =>
  (req, res, next) => {
    try {
      const response = handler(req);

      if (response instanceof SuccessResponse) {
        res.json(response);
        return;
      }

      res.send(JSON.stringify(response));
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.getStatus()).json({ message: error.message });

        return;
      }

      next(error);
      return;
    }
  };

const errorHandler = (): ErrorRequestHandler => (err, req, res, next) => {
  res.status(500).json({ message: 'Internal server error' });
  next();
};

async function register(app: Express, baseRoute: string, filePath: string): Promise<void> {
  const module: Record<string, unknown> = await import(filePath);
  const pathRoute = path.basename(filePath, '.js');

  let routePath = baseRoute + '/' + pathRoute;

  if (routePath.endsWith('/index')) {
    routePath = baseRoute;
  }

  routePath = routePath.replace(/\[(.*?)\]/g, ':$1');

  const supportedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'ANY'];

  for (const method of supportedMethods) {
    const methodKey = method.toLowerCase() as keyof Express;

    if (typeof module[method] === 'function' && typeof app[methodKey] === 'function') {
      const handler = module[method] as Handler;
      app[methodKey](routePath, wrapper(handler));
    }
  }
}

async function compile(app: Express, dir: string, baseRoute: string): Promise<void> {
  const files = await fs.promises.readdir(dir);

  for (const fileName of files) {
    const filePath = path.join(dir, fileName);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      await compile(app, filePath, `${baseRoute}/${fileName}`);
    } else if (fileName.endsWith('.js')) {
      await register(app, baseRoute, filePath);
    }
  }
}

async function load(app: Express, params: RouteLoaderParams): Promise<void> {
  if (!params.dir) {
    throw new Error("Cannot load router directory because it's undefined");
  }

  if (!fs.existsSync(params.dir)) {
    throw new Error(`Route directory ${params.dir} does not exist`);
  }

  await compile(app, params.dir, '');

  app.use(errorHandler());
}

export default { load };
