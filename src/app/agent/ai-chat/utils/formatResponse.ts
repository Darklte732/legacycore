/**
 * Format AI responses based on content type and structure
 * 
 * Provides appropriate formatting for different types of content:
 * - Normal conversational text gets natural paragraphs
 * - Data-heavy content gets structured formatting
 * - Lists are only used when appropriate
 * - Key points are highlighted
 */

/**
 * Detects the type of content in the response
 */
const detectContentType = (text: string): 'data' | 'list' | 'error' | 'conversation' => {
  // Check if this is an error message
  if (text.includes('Error:') || 
      text.includes('I apologize') || 
      text.includes('sorry')) {
    return 'error';
  }
  
  // Check if it's data-heavy content (containing numbers, percentages, tables)
  const dataPatterns = [
    /\$\d+(\.\d+)?/g, // Dollar amounts
    /\d+%/g,          // Percentages
    /total:/i,        // Total indicators
    /summary:/i,      // Summary indicators
    /statistics:/i,   // Statistics indicators
    /\|\s*[\w\s]+\s*\|/g, // Table-like structures
    /\b(database|query|result)\b/i // Database terminology
  ];
  
  if (dataPatterns.some(pattern => pattern.test(text))) {
    return 'data';
  }
  
  // Check if it's list-heavy content
  const listCount = (text.match(/\d+\.\s+/g) || []).length +
                   (text.match(/^\s*[\*\-\•]\s+/gm) || []).length;
  
  // If we have more than 3 list items, consider it list content
  if (listCount > 3) {
    return 'list';
  }
  
  // Default to conversational
  return 'conversation';
};

/**
 * Format conversational content with natural paragraphs
 */
const formatConversationalContent = (text: string): string => {
  return text
    // Add proper paragraph breaks
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, ' ')
    
    // Format occasional lists naturally
    .replace(/(\d+\.\s+)([^\n]+)/g, '<span class="text-teal-300">$1</span>$2<br>')
    .replace(/^[\*\-\•]\s+([^\n]+)/gm, '• $1<br>')
    
    // Highlight important phrases
    .replace(/"([^"]+)"/g, '<span class="text-indigo-300">"$1"</span>')
    .replace(/!(Important|Note|Warning|Tip):/gi, '<strong class="text-yellow-300">$1:</strong>')
    
    // Format inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-700 rounded px-1 py-0.5 text-sm">$1</code>');
};

/**
 * Format data-heavy content with structured presentation
 */
const formatDataContent = (text: string): string => {
  return text
    // Structure paragraphs
    .replace(/\n{2,}/g, '<br><br>')
    
    // Highlight data points
    .replace(/(\$\d+(\.\d+)?)/g, '<span class="text-green-400 font-medium">$1</span>')
    .replace(/(\d+%)/g, '<span class="text-indigo-300 font-medium">$1</span>')
    
    // Make headings stand out
    .replace(/\n?(#+)\s+([^\n]+)/g, (_, hashes, text) => {
      const level = hashes.length;
      const size = level === 1 ? 'xl' : level === 2 ? 'lg' : 'md';
      return `<div class="font-bold text-${size} my-3 text-teal-300">${text}</div>`;
    })
    
    // Format data sections with subtle emphasis
    .replace(/(Total:|Summary:|Results:|Statistics:)(\s*[\w\s\$\d\.\,]+)/gi, 
      '<div class="my-2"><span class="text-teal-300 font-medium">$1</span>$2</div>')
    
    // Format code and table-like structures
    .replace(/`([^`]+)`/g, '<code class="bg-gray-700 rounded px-1 py-0.5 text-sm">$1</code>')
    
    // Make links clickable
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-400 underline">$1</a>');
};

/**
 * Format list-heavy content
 */
const formatListContent = (text: string): string => {
  // Clean up raw "list-item" tags that might appear in the content
  let cleanedText = text.replace(/"list-item">/g, '');
  
  // Split the text into introduction and list parts
  const parts = cleanedText.split(/(\d+\.\s+|\*\s+|\-\s+|\•\s+)/);
  
  if (parts.length <= 1) {
    return formatConversationalContent(cleanedText);
  }
  
  // Get the introduction text (everything before the first list item)
  const firstListMarkerIndex = cleanedText.search(/(\d+\.\s+|\*\s+|\-\s+|\•\s+)/);
  let introText = firstListMarkerIndex > 0 ? cleanedText.substring(0, firstListMarkerIndex) : '';
  let listText = cleanedText.substring(firstListMarkerIndex);
  
  // Format the introduction as conversation
  const formattedIntro = introText ? formatConversationalContent(introText) + '<br><br>' : '';
  
  // Format numbered lists with proper structure
  let formattedList = listText
    .replace(/(\d+\.\s+)([^\n]+)/g, '<div class="list-item"><span class="text-teal-300 font-medium">$1</span>$2</div>')
    .replace(/^[\*\-\•]\s+([^\n]+)/gm, '<div class="list-item">$1</div>')
    
    // Format any remaining text naturally
    .replace(/\n/g, '<br>')
    
    // Highlight important phrases
    .replace(/"([^"]+)"/g, '<span class="text-indigo-300">"$1"</span>')
    .replace(/!(Important|Note|Warning|Tip):/gi, '<strong class="text-yellow-300">$1:</strong>');
  
  return formattedIntro + formattedList;
};

/**
 * Format error messages
 */
const formatErrorContent = (text: string): string => {
  return `<div class="text-red-400">${text}</div>`;
};

/**
 * Main formatting function that determines content type and applies appropriate formatting
 */
export const formatResponse = (text: string): string => {
  if (!text) return '';
  
  // Clean the input (remove excessive whitespace, etc.)
  let cleanedText = text.trim();
  
  // Pre-process any "list-item" text that appears in the response
  cleanedText = cleanedText.replace(/"list-item">([^<\n]*)/g, '<li>$1</li>');
  cleanedText = cleanedText.replace(/"list-item">\s*-\s*([^<\n]*)/g, '<li>$1</li>');
  
  // Detect content type
  const contentType = detectContentType(cleanedText);
  
  // Apply appropriate formatting based on content type
  switch (contentType) {
    case 'data':
      return formatDataContent(cleanedText);
    case 'list':
      return formatListContent(cleanedText);
    case 'error':
      return formatErrorContent(cleanedText);
    case 'conversation':
    default:
      return formatConversationalContent(cleanedText);
  }
}; 