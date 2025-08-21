import express from 'express';
import documentRouter from './controllers/document.js';
import { requestLogger, unknownEndpoint } from './utils/middleware.js';

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use('/api/query', documentRouter);
app.use(unknownEndpoint);

export default app;
