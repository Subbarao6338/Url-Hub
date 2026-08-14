import { describe, it, expect } from 'vitest';
import { RecursiveCharacterTextSplitter } from './textSplitter';

describe('RecursiveCharacterTextSplitter', () => {
  it('should split text into chunks based on chunkSize', () => {
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 20, chunkOverlap: 0 });
    const text = 'Paragraph 1 line text.\n\nParagraph 2 line text.';
    const chunks = splitter.splitText(text);

    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach(chunk => {
      expect(chunk.length).toBeLessThanOrEqual(30); // reasonable chunk length check
    });
  });

  it('should handle document objects properly in splitDocuments', () => {
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 50, chunkOverlap: 10 });
    const docs = [
      { pageContent: 'First document text content that is relatively long.', metadata: { id: 1 } },
      { text: 'Second document text.', metadata: { id: 2 } }
    ];

    const result = splitter.splitDocuments(docs);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0]).toHaveProperty('pageContent');
    expect(result[0].metadata).toHaveProperty('id', 1);
    expect(result[0].metadata).toHaveProperty('chunkIndex');
  });

  it('should return empty array for empty document list or text', () => {
    const splitter = new RecursiveCharacterTextSplitter();
    expect(splitter.splitText('')).toEqual([]);
    expect(splitter.splitDocuments([])).toEqual([]);
  });
});
