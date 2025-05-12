'use client'

import React, { useState } from 'react'

export type MessageProps = {
  id?: string; // Add ID for deletion functionality
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  onDelete?: (messageId: string) => void; // Add onDelete handler
}

export const Message: React.FC<MessageProps> = ({ 
  id,
  role, 
  content, 
  timestamp,
  onDelete 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirmDelete) {
      // User confirmed deletion
      setIsDeleting(true);
      
      // Call the onDelete handler if it exists and we have an ID
      if (onDelete && id) {
        onDelete(id);
      }
    } else {
      // Ask for confirmation
      setConfirmDelete(true);
      
      // Auto-clear confirmation after 3 seconds
      setTimeout(() => {
        setConfirmDelete(false);
      }, 3000);
    }
  };
  
  return (
    <div className={`px-4 py-3 flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {role === 'assistant' && (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
          bg-teal-600 text-white mr-3`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <circle cx="15.5" cy="8.5" r="1.5"></circle>
            <path d="M8.5 14a4 4 0 0 0 7 0"></path>
          </svg>
        </div>
      )}
      
      <div className={`max-w-[75%] ${role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-100'} 
        rounded-lg px-4 py-3 shadow-md`}>
        <div className="flex justify-between items-start">
          {onDelete && id && (
            <div className="flex items-center text-xs opacity-0 group-hover:opacity-100 absolute top-2 right-2">
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={`p-1 rounded ${
                  confirmDelete 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                } transition-colors`}
                aria-label={confirmDelete ? "Confirm delete" : "Delete message"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className="prose prose-invert max-w-none message-content">
          {/* Properly render HTML content for formatted messages */}
          {content.includes('<div') || 
           content.includes('<span') || 
           content.includes('<br') || 
           content.includes('<code') || 
           content.includes('list-item') ? (
            <div 
              dangerouslySetInnerHTML={{ __html: content }} 
              className="formatted-content"
            />
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>
        
        {timestamp && (
          <div className="text-xs mt-2 opacity-75">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
      
      {role === 'user' && (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
          bg-indigo-600 text-white ml-3`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      )}
    </div>
  )
} 