import type { Handler } from '../helpers/frouter.js';
import { SuccessResponse } from '../helpers/frouter.js';

export const GET: Handler = (): SuccessResponse => {
  return new SuccessResponse({ what: 'hello darkness my old friend' });
};
