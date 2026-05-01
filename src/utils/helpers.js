/**
 * Highlight search query within text by wrapping matches in <mark> tags.
 * @param {string} text - The text to process.
 * @param {string} query - The search query.
 * @returns {string} - The HTML string with highlighted matches.
 */
export const highlightText = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};
