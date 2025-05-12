/**
 * Direct fix for manager script assistant display issue.
 * This script is injected by the server to ensure script content is correctly displayed.
 */
(function() {
  console.log('[Fix Script Display] Loaded at', new Date().toISOString());
  
  // Add required styles for script display
  function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .script-preview {
        font-family: 'Courier New', monospace !important;
        font-size: 14px !important;
        line-height: 1.6 !important;
        background-color: #f9f9f9 !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 6px !important;
        padding: 1.5rem !important;
        max-height: 100% !important;
        overflow-y: auto !important;
        white-space: pre-wrap !important;
        color: #333 !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      .script-preview h1, 
      .script-preview h2, 
      .script-preview h3, 
      .script-preview h4 {
        color: #2c3e50 !important;
        margin-top: 1.5em !important;
        margin-bottom: 0.75em !important;
        font-weight: 600 !important;
        display: block !important;
      }
      
      .script-preview h1 {
        font-size: 1.7em !important;
        border-bottom: 2px solid #e0e0e0 !important;
        padding-bottom: 0.3em !important;
      }
      
      .script-preview h2 {
        font-size: 1.5em !important;
        border-bottom: 1px solid #e0e0e0 !important;
        padding-bottom: 0.2em !important;
      }
      
      .script-preview h3 {
        font-size: 1.3em !important;
      }
      
      .script-preview p {
        margin-bottom: 1em !important;
        display: block !important;
      }
      
      .script-preview ul, 
      .script-preview ol {
        margin-left: 1.5em !important;
        margin-bottom: 1em !important;
        display: block !important;
      }
      
      .script-preview li {
        margin-bottom: 0.5em !important;
        display: list-item !important;
      }
    `;
    
    document.head.appendChild(styleEl);
    console.log('[Fix Script Display] Styles injected');
  }
  
  // Simple function to extract text content from React state
  function extractScriptFromState() {
    try {
      // First try to find it in window.__NEXT_DATA__
      if (window.__NEXT_DATA__ && 
          window.__NEXT_DATA__.props && 
          window.__NEXT_DATA__.props.pageProps && 
          window.__NEXT_DATA__.props.pageProps.__reactState) {
        return window.__NEXT_DATA__.props.pageProps.__reactState.scriptText;
      }
      
      // Look for any script text in React dev tools
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && 
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers) {
        // Attempt to find React state with scriptText
        return null; // Complex to implement safely
      }
      
      return null;
    } catch (e) {
      console.error('[Fix Script Display] Error extracting script:', e);
      return null;
    }
  }
  
  // Find the script preview element and apply content
  function findAndFixScriptPreview() {
    const scriptPreview = document.querySelector('.script-preview');
    
    if (scriptPreview) {
      console.log('[Fix Script Display] Found script preview element');
      
      // Force script preview to be visible
      scriptPreview.style.display = 'block';
      scriptPreview.style.visibility = 'visible';
      scriptPreview.style.opacity = '1';
      scriptPreview.style.color = '#333';
      scriptPreview.style.backgroundColor = '#f9f9f9';
      scriptPreview.style.whiteSpace = 'pre-wrap';
      
      // If the script preview appears empty, inject placeholder content
      if (!scriptPreview.innerHTML.trim() || 
          scriptPreview.innerHTML.includes('Generate Your Script')) {
        
        // Try to get script content from state
        const stateContent = extractScriptFromState();
        
        if (stateContent) {
          console.log('[Fix Script Display] Using script content from state');
          renderMarkdown(scriptPreview, stateContent);
        } else {
          console.log('[Fix Script Display] Script preview appears empty, monitoring for changes');
        }
      } else {
        console.log('[Fix Script Display] Script preview has content, formatting markdown');
        const content = scriptPreview.innerHTML;
        renderMarkdown(scriptPreview, content);
      }
      
      return true;
    }
    
    return false;
  }
  
  // Format markdown in content
  function renderMarkdown(element, content) {
    if (!content) return;
    
    // Format markdown-style headers
    const processedContent = content
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^#### (.*?)$/gm, '<h4>$1</h4>')
      .replace(/^\* (.*?)$/gm, '<li>$1</li>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    element.innerHTML = `<p>${processedContent}</p>`;
  }
  
  // Override script generation functionality
  function enhanceScriptGeneration() {
    // Find the Generate Script button
    const buttons = document.querySelectorAll('button');
    let generateScriptButton = null;
    
    for (const button of buttons) {
      if (button.textContent.includes('Generate Script')) {
        generateScriptButton = button;
        break;
      }
    }
    
    if (generateScriptButton) {
      console.log('[Fix Script Display] Found Generate Script button, enhancing');
      
      // Add our own click handler that runs after React's
      const originalClick = generateScriptButton.onclick;
      generateScriptButton.onclick = function(e) {
        if (originalClick) originalClick.call(this, e);
        
        // Run our fix with some delay to let React render
        setTimeout(() => {
          if (!findAndFixScriptPreview()) {
            // If no script preview found, retry a few times
            setTimeout(findAndFixScriptPreview, 500);
            setTimeout(findAndFixScriptPreview, 1000);
          }
        }, 200);
      };
      
      // Also backup by listening for clicks
      generateScriptButton.addEventListener('click', () => {
        // Simulate view change to script view after generation
        setTimeout(() => {
          const viewButtons = document.querySelectorAll('button');
          for (const button of viewButtons) {
            if (button.textContent.includes('Back to Form')) {
              // Found the Back button, which means we're in script view
              findAndFixScriptPreview();
            }
          }
        }, 1000);
      });
    }
  }
  
  // Initialize and monitor for changes
  function initialize() {
    console.log('[Fix Script Display] Initializing fixes');
    
    // Inject our CSS first
    injectStyles();
    
    // Try to fix any existing script preview
    findAndFixScriptPreview();
    
    // Enhance the script generation 
    enhanceScriptGeneration();
    
    // Monitor DOM for changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Only process if we see relevant changes
          const hasRelevantChanges = Array.from(mutation.addedNodes).some(node => {
            if (node.nodeType === 1) { // Element node
              if (node.classList && 
                 (node.classList.contains('script-preview') || 
                  node.querySelector('.script-preview'))) {
                return true;
              }
            }
            return false;
          });
          
          if (hasRelevantChanges) {
            console.log('[Fix Script Display] Detected relevant DOM changes, applying fix');
            findAndFixScriptPreview();
          }
        }
      }
    });
    
    // Watch the entire body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Clean up observer after 5 minutes
    setTimeout(() => {
      observer.disconnect();
      console.log('[Fix Script Display] Observer disconnected after timeout');
    }, 300000);
    
    // Force periodic checks in case state changes without DOM mutations
    const intervalId = setInterval(() => {
      findAndFixScriptPreview();
    }, 3000);
    
    // Stop interval checks after 5 minutes
    setTimeout(() => {
      clearInterval(intervalId);
      console.log('[Fix Script Display] Interval checks stopped after timeout');
    }, 300000);
  }
  
  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded, run now
    initialize();
  }
  
  // Also run delayed attempts in case the app is slow to render
  setTimeout(findAndFixScriptPreview, 500);
  setTimeout(findAndFixScriptPreview, 1500);
  setTimeout(findAndFixScriptPreview, 3000);
})(); 