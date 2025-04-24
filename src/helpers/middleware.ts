import { randomUUID } from 'crypto';

import type { NextFunction, Request, Response } from 'express';
import { requestCtx } from './context.js';

export function applyTracingContext(req: Request, res: Response, next: NextFunction): void {
  requestCtx.run(
    {
      traceId: req.header('trace-id') ?? randomUUID(),
      requestId: randomUUID(),
      getRequest: function () {
        return req;
      },
    },
    () => {
      next();
    },
  );
}
