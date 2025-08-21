import { Router } from 'express';
import { info } from '../utils/logger.js';

const documentRouter = Router();

documentRouter.post('/', (request, response) => {
  const { document, questions } = request.body;
  info(`document: ${document}`);
  info(`questions: ${questions}`);

  response.status(202).end();
});

export default documentRouter;
