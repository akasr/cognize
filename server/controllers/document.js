import { Router } from 'express';
import { info, error } from '../utils/logger.js';
import { upload, processPdf } from '../services/processDocument.js';

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

  info('Processing document');
  try {
    const source = type === 'url' ? url : request.file;
    const document = await processPdf(type, source);
    info('Document processed successfully');
    info('Extracted text content:', document.extractedText.substring(0, 100));
    info('Document metadata:', document.metadata);

    return response.status(200).json({
      success: true,
      message: 'Document processed successfully',
      data: {
        textLength: document.extractedText.length,
        metadata: document.metadata,
      },
    });
  } catch (err) {
    error(`Error processing document: ${err.message}`);
    return response.status(500).json({ error: err.message });
  }
});

export default uploadRouter;
