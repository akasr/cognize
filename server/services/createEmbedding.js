import { GoogleGenAI } from '@google/genai';

async function createEmbedding(chunks) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: chunks,
  });

  return response.embeddings;
}

export default createEmbedding;
