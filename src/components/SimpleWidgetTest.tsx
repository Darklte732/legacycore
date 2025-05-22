'use client';

import { useEffect, useRef } from 'react';

// Add custom window type to handle widget loaded status
declare global {
  interface Window {
    elevenLabsWidgetLoaded?: boolean;
    elevenlabsCustomElementDefined?: boolean;
  }
}

export default function SimpleWidgetTest() {
  const widgetRef = useRef<HTMLElement | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Clear any existing widgets
    const existingWidgets = document.querySelectorAll('elevenlabs-convai');
    existingWidgets.forEach(widget => widget.remove());
    
    // Remove any existing scripts
    const existingScripts = document.querySelectorAll('script[src="https://elevenlabs.io/convai-widget/index.js"]');
    existingScripts.forEach(script => script.remove());
    
    // Create the widget element with the specific agent
    const widget = document.createElement('elevenlabs-convai');
    widget.setAttribute('agent-id', 'WmZI43m83dXjIj0WPm00');
    widget.id = 'elevenlabs-widget';
    widgetRef.current = widget;
    
    // Add the widget to the DOM
    document.body.appendChild(widget);
    
    // Create the script element
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.type = 'text/javascript';
    scriptRef.current = script;
    
    // Add the script to the DOM
    document.body.appendChild(script);
    
    // Set a flag to prevent multiple instances
    window.elevenLabsWidgetLoaded = true;
    
    // Style the widget to appear in the bottom right
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      elevenlabs-convai {
        position: fixed;
        z-index: 1000;
        bottom: 80px;
        right: 20px;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      // Clean up when component unmounts
      if (widgetRef.current) {
        widgetRef.current.remove();
      }
      if (scriptRef.current) {
        scriptRef.current.remove();
      }
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
  
  return null; // This component doesn't render anything directly
} 