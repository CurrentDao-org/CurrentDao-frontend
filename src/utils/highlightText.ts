export interface HighlightMatch {
  value: string;
  indices: [number, number][];
}

export const highlightText = (text: string, query: string): string => {
  if (!query || !text) return text;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  let highlightedText = text;
  let offset = 0;
  
  let index = textLower.indexOf(queryLower);
  while (index !== -1) {
    const originalIndex = index + offset;
    highlightedText = 
      highlightedText.slice(0, originalIndex) +
      '<mark class="bg-yellow-200 text-yellow-900 font-medium">' +
      highlightedText.slice(originalIndex, originalIndex + query.length) +
      '</mark>' +
      highlightedText.slice(originalIndex + query.length);
    
    offset += 43; // Length of the mark tags: 43 characters
    index = textLower.indexOf(queryLower, index + 1);
  }
  
  return highlightedText;
};

export const highlightMultiple = (text: string, queries: string[]): string => {
  if (!queries || queries.length === 0 || !text) return text;
  
  let highlightedText = text;
  
  // Sort queries by length (longest first) to avoid overlapping highlights
  const sortedQueries = [...queries].sort((a, b) => b.length - a.length);
  
  sortedQueries.forEach(query => {
    highlightedText = highlightText(highlightedText, query);
  });
  
  return highlightedText;
};

export const createHighlightedRenderer = (query: string) => {
  return (text: string) => {
    const highlighted = highlightText(text, query);
    return { __html: highlighted };
  };
};

export const getHighlightRanges = (text: string, query: string): [number, number][] => {
  if (!query || !text) return [];
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const ranges: [number, number][] = [];
  
  let index = textLower.indexOf(queryLower);
  while (index !== -1) {
    ranges.push([index, index + query.length]);
    index = textLower.indexOf(queryLower, index + 1);
  }
  
  return ranges;
};

export const truncateWithHighlight = (text: string, query: string, maxLength: number = 100): string => {
  if (!query || !text || text.length <= maxLength) return highlightText(text, query);
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const queryIndex = textLower.indexOf(queryLower);
  
  if (queryIndex === -1) {
    return text.substring(0, maxLength - 3) + '...';
  }
  
  const queryLength = query.length;
  const start = Math.max(0, queryIndex - 30);
  const end = Math.min(text.length, queryIndex + queryLength + 30);
  
  let truncated = text.substring(start, end);
  if (start > 0) truncated = '...' + truncated;
  if (end < text.length) truncated = truncated + '...';
  
  return highlightText(truncated, query);
};
