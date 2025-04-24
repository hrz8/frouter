import type { Context } from '../../../helpers/context.js';
import type { Handler } from '../../../helpers/frouter.js';
import { SuccessResponse } from '../../../helpers/frouter.js';

export const GET: Handler = (ctx: Context): SuccessResponse => {
  const req = ctx.getRequest();
  console.warn(req.params.orderId);
  return new SuccessResponse(ctx, { what: 'order details' });
};

export const PUT: Handler = (ctx: Context): SuccessResponse => {
  return new SuccessResponse(ctx, { what: 'edit order' });
};

export const DELETE: Handler = (ctx: Context): SuccessResponse => {
  return new SuccessResponse(ctx, { what: 'delete order' });
};
