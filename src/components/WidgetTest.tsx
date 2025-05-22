'use client';

import { useEffect, useState } from 'react';

export default function WidgetTest() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [showDebug, setShowDebug] = useState<boolean>(false);

  useEffect(() => {
    try {
      console.log('WidgetTest: Loading ElevenLabs script');
      setStatus('Loading script...');
      
      // Clear any existing script to avoid conflicts
      const existingScripts = document.querySelectorAll('script[src="https://elevenlabs.io/convai-widget/index.js"]');
      existingScripts.forEach(script => script.remove());
      
      // Remove any existing widget elements
      const existingWidgets = document.querySelectorAll('elevenlabs-convai');
      existingWidgets.forEach(widget => widget.remove());
      
      // Create and append script
      const script = document.createElement('script');
      script.src = 'https://elevenlabs.io/convai-widget/index.js';
      script.async = true;
      script.type = 'text/javascript';
      
      script.onload = () => {
        console.log('WidgetTest: Script loaded successfully');
        setStatus('Script loaded successfully, initializing widget...');
        
        // Let's check if we can create the custom element programmatically
        setTimeout(() => {
          try {
            // Create the widget element after script is loaded
            const widgetElement = document.createElement('elevenlabs-convai');
            widgetElement.setAttribute('agent-id', 'WmZI43m83dXjIj0WPm00');
            
            // Add styles directly to element to ensure visibility
            widgetElement.style.position = 'fixed';
            widgetElement.style.bottom = '20px';
            widgetElement.style.right = '20px';
            widgetElement.style.zIndex = '9999';
            widgetElement.style.minWidth = '60px';
            widgetElement.style.minHeight = '60px';
            widgetElement.style.backgroundColor = 'rgba(0,0,0,0.1)'; // Slight background to see position
            
            // Append to body directly
            document.body.appendChild(widgetElement);
            setStatus('Widget created and added to DOM');
          } catch (error) {
            console.error('WidgetTest: Error creating widget element:', error);
            setStatus(`Error creating widget: ${error.message}`);
          }
        }, 1000);
      };
      
      script.onerror = (error) => {
        console.error('WidgetTest: Error loading script:', error);
        setStatus(`Script loading error: ${error.toString()}`);
      };
      
      document.body.appendChild(script);
    } catch (error) {
      console.error('WidgetTest: Initialization error:', error);
      setStatus(`Initialization error: ${error.message}`);
    }
    
    return () => {
      console.log('WidgetTest: Cleaning up');
      // No need to remove the script here as we want it to stay loaded
    };
  }, []);

  return (
    <div className="p-4 border border-gray-300 rounded bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-2">ElevenLabs Widget Test</h2>
      <p className="mb-2">Status: {status}</p>
      
      <button 
        onClick={() => setShowDebug(!showDebug)}
        className="px-3 py-1 bg-blue-600 text-white rounded mr-2 text-sm"
      >
        {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
      </button>
      
      <button 
        onClick={() => {
          // Force reload widget
          const widgetElement = document.createElement('elevenlabs-convai');
          widgetElement.setAttribute('agent-id', 'WmZI43m83dXjIj0WPm00');
          widgetElement.style.position = 'fixed';
          widgetElement.style.bottom = '20px';
          widgetElement.style.right = '20px';
          widgetElement.style.zIndex = '9999';
          document.body.appendChild(widgetElement);
        }}
        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
      >
        Force Create Widget
      </button>
      
      {showDebug && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono">
          <p>Widget Script Status: {document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]') ? 'Found in DOM' : 'Not Found'}</p>
          <p>Widget Element Status: {document.querySelector('elevenlabs-convai') ? 'Found in DOM' : 'Not Found'}</p>
          <p>Custom Elements defined: {window.customElements ? 'Available' : 'Not Available'}</p>
          <p>Is 'elevenlabs-convai' defined: {window.customElements && window.customElements.get ? (window.customElements.get('elevenlabs-convai') ? 'Yes' : 'No') : 'Cannot check'}</p>
        </div>
      )}
    </div>
  );
} 