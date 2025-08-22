import { error } from './logger.js';
import multer from 'multer';

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  next();
};

const corsMiddleware = (request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    response.sendStatus(200);
  } else {
    next();
  }
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (err, request, response, next) => {
  error(err);

  // PDF Processing Errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return response.status(400).json({ error: 'File too large' });
    }
    return response.status(400).json({ error: 'File upload error' });
  }
  if (err.message === 'Only PDF files are allowed') {
    return response.status(400).json({ error: 'Only PDF files are allowed' });
  }

  return next(err);
};

export { errorHandler, requestLogger, unknownEndpoint, corsMiddleware };
