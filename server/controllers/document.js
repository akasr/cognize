import { Router } from 'express';
import { info, error } from '../utils/logger.js';
import { upload, processPdf } from '../services/processDocument.js';
import splitDocument from '../services/splitDocument.js';
import createEmbedding from '../services/createEmbedding.js';

const uploadRouter = Router();

uploadRouter.post('/', upload.single('document'), async (request, response) => {
  const { type, url } = request.body;

  // Validate document type
  if (!type || (type !== 'file' && type !== 'url')) {
    error('Invalid or missing document type');
    return response.status(400).json({
      error: 'Invalid document type. Must be either "file" or "url"',
    });
  }
  if (type === 'file') {
    if (!request.file) {
      error('No document received');
      return response.status(400).json({ error: 'No document uploaded' });
    }
  }
  if (type === 'url') {
    if (!url) {
      error('No URL provided');
      return response.status(400).json({ error: 'No URL provided' });
    }

    try {
      const urlObj = new globalThis.URL(url);
      // Additional security check - only allow http/https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        error('Invalid URL protocol');
        return response.status(400).json({ error: 'Only HTTP and HTTPS URLs are allowed' });
      }
    } catch {
      error('Invalid URL format');
      return response.status(400).json({ error: 'Invalid URL format' });
    }
  }

  try {
    info('Processing document');
    const source = type === 'url' ? url : request.file;
    const document = await processPdf(type, source);
    info('Document processed successfully');
    info('Extracted text content:', document.extractedText.substring(0, 100));
    info('Document metadata:', document.metadata);

    info('Splitting document into chunks');
    const chunks = await splitDocument(document.extractedText);
    info(`Document split into ${chunks.length} chunks`);

    info('Creating embeddings');
    const embeddings = await createEmbedding(chunks);
    info('Embeddings created successfully\n', embeddings);

    return response.status(200).json({
      success: true,
      message: 'Document processed successfully',
      status: ['pdf processed', 'chunks split', 'embeddings created'],
      data: {
        textLength: document.extractedText.length,
        metadata: document.metadata,
      },
    });
  } catch (err) {
    error(`${err.message}`);
    return response.status(500).json({ error: err.message });
  }
});

export default uploadRouter;
