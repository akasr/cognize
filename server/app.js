import express from 'express';
import uploadRouter from './controllers/document.js';
import {
  errorHandler,
  requestLogger,
  unknownEndpoint,
  corsMiddleware,
} from './utils/middleware.js';

const app = express();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(corsMiddleware);
app.use(express.json());
app.use(requestLogger);
app.use('/api/upload', uploadRouter);
app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
