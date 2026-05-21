/**
 * Exa search utility — used for any internet-related queries.
 * Import and call searchExa() from anywhere in the app.
 */
import Exa from 'exa-js';

const EXA_API_KEY = process.env.EXA_API_KEY || '265c723e-9c98-40f8-bc3e-4a65311d8fbd';

const exa = new Exa(EXA_API_KEY);

export interface SearchResult {
  title: string;
  url: string;
  highlights?: string[];
  publishedDate?: string;
  author?: string;
}

export async function searchExa(
  query: string,
  options?: { numResults?: number; type?: 'fast' | 'neural' }
): Promise<SearchResult[]> {
  const response = await exa.search(query, {
    type: options?.type || 'fast',
    numResults: options?.numResults || 5,
    contents: { highlights: true },
  });

  return response.results.map(r => ({
    title: r.title || '',
    url: r.url,
    highlights: r.highlights,
    publishedDate: r.publishedDate,
    author: r.author,
  }));
}

export default exa;
