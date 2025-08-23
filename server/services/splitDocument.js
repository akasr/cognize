import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const splitDocument = async (document) => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 200,
  });

  const chunks = await textSplitter.splitText(document);
  return chunks;
};

export default splitDocument;
