/**
 * Script Generator Helper
 * This file contains functions to help with script generation and display.
 */

// Script viewing and styling
export function setupScriptStyles() {
  // Apply additional styling to script display area
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .script-preview {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.6;
      background-color: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 1.5rem;
      max-height: 100%;
      overflow-y: auto;
    }
    
    .script-preview h1, 
    .script-preview h2, 
    .script-preview h3, 
    .script-preview h4 {
      color: #2c3e50;
      margin-top: 1.5em;
      margin-bottom: 0.75em;
      font-weight: 600;
    }
    
    .script-preview h1 {
      font-size: 1.7em;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 0.3em;
    }
    
    .script-preview h2 {
      font-size: 1.5em;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 0.2em;
    }
    
    .script-preview h3 {
      font-size: 1.3em;
    }
    
    .script-preview p {
      margin-bottom: 1em;
    }
    
    .script-preview ul, 
    .script-preview ol {
      margin-left: 1.5em;
      margin-bottom: 1em;
    }
    
    .script-preview li {
      margin-bottom: 0.5em;
    }
  `;
  
  document.head.appendChild(styleElement);
  return () => {
    document.head.removeChild(styleElement);
  };
}

// Force render the script content when the view changes
export function triggerScriptRender() {
  // This function triggers a re-render by forcing a layout recalculation
  const scriptElements = document.querySelectorAll('.script-preview');
  
  scriptElements.forEach(element => {
    // Force a layout recalculation
    const height = element.offsetHeight;
    element.style.opacity = '0.99';
    
    // Reset after a short delay
    setTimeout(() => {
      element.style.opacity = '1';
    }, 10);
  });
}

// Helper function to copy text to clipboard
export function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Unable to copy to clipboard', err);
    }
    
    document.body.removeChild(textArea);
  }
} 