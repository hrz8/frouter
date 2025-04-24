import type { Context } from '../helpers/context.js';
import type { Handler } from '../helpers/frouter.js';
import { SuccessResponse } from '../helpers/frouter.js';

export const GET: Handler = (ctx: Context): SuccessResponse => {
  return new SuccessResponse(ctx, {
    what: 'hello darkness my old friend',
  });
};
