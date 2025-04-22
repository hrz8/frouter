import type { Handler } from '../../../helpers/frouter.js';
import { SuccessResponse } from '../../../helpers/frouter.js';

export const GET: Handler = (): SuccessResponse => {
  return new SuccessResponse({ what: 'order details' });
};

export const PUT: Handler = (): SuccessResponse => {
  return new SuccessResponse({ what: 'edit order' });
};

export const DELETE: Handler = (): SuccessResponse => {
  return new SuccessResponse({ what: 'delete order' });
};
