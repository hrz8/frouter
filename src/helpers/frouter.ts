import fs from 'fs';
import path from 'path';

import type { Express, Handler as ExpressHandler, ErrorRequestHandler } from 'express';
import type { Context } from './context.js';
import { requestCtx } from './context.js';
import { applyTracingContext } from './middleware.js';

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

type BaseResponse = {
  data: any;
  debug: {
    traceId: string;
    requestId: string;
  };
};

export class SuccessResponse {
  constructor(
    private ctx: Context,
    public data: any,
  ) {}

  respond(): BaseResponse {
    return {
      data: this.data,
      debug: {
        traceId: this.ctx.traceId,
        requestId: this.ctx.requestId,
      },
    };
  }
}

export type Handler = (ctx: Context) => Promise<SuccessResponse> | SuccessResponse;

const endpointHandlerWrapper =
  (handler: Handler): ExpressHandler =>
  (req, res, next) => {
    try {
      const response = handler(requestCtx.getStore()!);

      if (response instanceof SuccessResponse) {
        res.json(response.respond());
        return;
      }

      res.send(response);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.getStatus()).json({ message: error.message });

        return;
      }

      next(error);
      return;
    }
  };

const errorHandlerWrapper =
  (defaultErrorMessage: string): ErrorRequestHandler =>
  (err, req, res, next) => {
    res.status(500).json({ message: defaultErrorMessage });
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
      app[methodKey](routePath, endpointHandlerWrapper(handler));
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

  app.use(applyTracingContext);

  await compile(app, params.dir, '');

  app.use(errorHandlerWrapper('Internal server error'));
}

export default { load };
