import type { Handler } from '../../helpers/frouter.js';
import { SuccessResponse } from '../../helpers/frouter.js';

export const POST: Handler = (): SuccessResponse => {
  return new SuccessResponse({ what: 'create order' });
};

export const GET: Handler = (): SuccessResponse => {
  return new SuccessResponse({ what: 'list orders' });
};
