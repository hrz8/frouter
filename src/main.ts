import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import express from 'express';
import winston from 'winston';

import frouter from './helpers/frouter.js';

const app = express();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

await frouter.load(app, { dir: join(__dirname, 'routes') });

app.listen(3088, function () {
  logger.info('server started 🚀');
});
