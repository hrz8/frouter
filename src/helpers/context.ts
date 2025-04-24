import type { Request } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface Context {
  traceId: string;
  requestId: string;
  getRequest(): Request;
}

export const requestCtx = new AsyncLocalStorage<Context>();
