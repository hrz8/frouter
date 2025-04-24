import type { Context } from '../../helpers/context.js';
import type { Handler } from '../../helpers/frouter.js';
import { SuccessResponse } from '../../helpers/frouter.js';

export const POST: Handler = (ctx: Context): SuccessResponse => {
  return new SuccessResponse(ctx, { what: 'create order' });
};

export const GET: Handler = (ctx: Context): SuccessResponse => {
  return new SuccessResponse(ctx, { what: 'list orders' });
};
