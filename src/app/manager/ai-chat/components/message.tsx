'use client'

import React, { useState } from 'react'
import Image from 'next/image'

export interface MessageProps {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  onDelete?: (id: string) => void;
}

export const Message: React.FC<MessageProps> = ({ 
  id,
  role, 
  content, 
  timestamp,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Format the timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Handle message deletion
  const handleDelete = () => {
    if (confirmDelete && id && onDelete) {
      onDelete(id);
      setShowMenu(false);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  };

  // Reset the confirm state when menu closes
  const handleCloseMenu = () => {
    setShowMenu(false);
    setTimeout(() => {
      setConfirmDelete(false);
    }, 200);
  };

  return (
    <div 
      className={`flex ${role === 'assistant' ? 'bg-gray-50' : 'bg-white'} rounded-lg p-4 relative group`}
      onMouseLeave={handleCloseMenu}
    >
      {/* Message avatar */}
      <div className="mr-4 flex-shrink-0">
        {role === 'assistant' ? (
          <Image 
            src="/images/agent-icon.png" 
            alt="Assistant" 
            width={36} 
            height={36} 
            className="rounded-full"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
        )}
      </div>
      
      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-1">
          <p className="font-medium text-gray-900 mr-2">
            {role === 'assistant' ? 'LegacyCore AI' : 'You'}
          </p>
          <p className="text-xs text-gray-500">{formatTime(timestamp)}</p>
        </div>
        
        <div 
          className="message-content prose prose-sm max-w-none text-gray-600"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      
      {/* Options menu */}
      {id && onDelete && (
        <div className={`absolute top-2 right-2 ${showMenu ? 'block' : 'hidden group-hover:block'}`}>
          <button
            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            onClick={() => setShowMenu(!showMenu)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
          
          {showMenu && (
            <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
              <button
                className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-100 text-red-600"
                onClick={handleDelete}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
                {confirmDelete ? 'Confirm' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 