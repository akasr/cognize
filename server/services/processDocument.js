import multer from 'multer';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { info, error } from '../utils/logger.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    fieldSize: 1 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

const validatePdfBuffer = (buffer) => {
  const pdfSignature = Buffer.from('%PDF');
  if (!buffer.subarray(0, 4).equals(pdfSignature)) {
    throw new Error('File is not a valid PDF - missing PDF signature');
  }

  const bufferString = buffer.toString('utf8', 0, 100).toLowerCase();
  if (bufferString.includes('<html') || bufferString.includes('<!doctype')) {
    throw new Error('File appears to be HTML, not a PDF');
  }

  return true;
};

const downloadPdfAsBuffer = async (url) => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      maxRedirects: 5,
      timeout: 30000,
      maxContentLength: 10 * 1024 * 1024,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/pdf,*/*',
      },
    });

    // Check content type
    const contentType = response.headers['content-type'];
    if (contentType && !contentType.includes('application/pdf')) {
      info(`Warning: Content-Type is ${contentType}, not application/pdf`);
    }

    const buffer = Buffer.from(response.data);
    validatePdfBuffer(buffer);

    return buffer;
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      throw new Error('Request timeout - PDF download took too long');
    }
    if (err.response?.status === 404) {
      throw new Error('PDF not found at the provided URL');
    }
    if (err.response?.status === 403) {
      throw new Error('Access denied to PDF URL');
    }

    error('Axios error details:', err.response?.status, err.response?.statusText);
    throw new Error(`Failed to download PDF: ${err.message}`);
  }
};

const extractMetadata = async (pdfDocument) => {
  try {
    const metadata = await pdfDocument.getMetadata();
    const documentInfo = {
      title: metadata.info.Title || null,
      author: metadata.info.Author || null,
      subject: metadata.info.Subject || null,
      keywords: metadata.info.Keywords || null,
      creator: metadata.info.Creator || null,
      producer: metadata.info.Producer || null,
      creationDate: metadata.info.CreationDate || null,
      modificationDate: metadata.info.ModDate || null,
      pdfVersion: metadata.info.PDFFormatVersion || null,
      numPages: pdfDocument.numPages,
      isEncrypted: metadata.info.IsEncrypted || false,
      isLinearized: metadata.info.IsLinearized || false,
    };

    return documentInfo;
  } catch (err) {
    error('Error extracting metadata:', err.message);
    return null;
  }
};

const processPdf = async (type, source) => {
  let pdfBuffer;
  if (type === 'url') {
    try {
      info('Downloading PDF from URL');
      pdfBuffer = await downloadPdfAsBuffer(source);
      info('PDF downloaded successfully');
    } catch (err) {
      error('Error downloading PDF:', err.message);
      throw new Error(`Could not download PDF: ${err.message}`);
    }
  } else {
    pdfBuffer = source.buffer;
  }

  info('Extracting text content');
  let extractedText = '';
  let metadata = null;
  try {
    const pdfUint8Array = new Uint8Array(pdfBuffer);
    const loadingTask = pdfjsLib.getDocument({ data: pdfUint8Array });
    const pdfDocument = await loadingTask.promise;

    metadata = await extractMetadata(pdfDocument);
    info('Metadata extracted');

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      extractedText += `${pageText}\n`;
    }

    info('PDF parsed successfully');
  } catch (err) {
    error('Error extracting text from PDF:', err.message);
    throw new Error(`Could not extract text from PDF: ${err.message}`);
  }
  return {
    extractedText,
    metadata,
  };
};

export { upload, downloadPdfAsBuffer, processPdf };
