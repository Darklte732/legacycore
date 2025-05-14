'use client'

import { FC, useState, useEffect } from 'react'
import Image from 'next/image'
import useUserSession from '@/hooks/useUserSession'
import { PlusCircle, Search, Trash2, Edit, Check, X } from 'lucide-react'

// Simple interface for the sidebar component
type SidebarProps = {
  chats: any[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onUpdateChatTitle?: (chatId: string, newTitle: string) => void;
}

export const Sidebar: FC<SidebarProps> = ({ 
  chats = [], 
  activeChat = null, 
  onChatSelect = () => {}, 
  onNewChat = () => {}, 
  onDeleteChat = () => {},
  onUpdateChatTitle = () => {} 
}) => {
  const { user } = useUserSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Filter chats based on search term
  const filteredChats = searchTerm 
    ? chats.filter(chat => 
        chat.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : chats;
  
  // Handle starting to edit a chat title
  const handleEditStart = (e: React.MouseEvent, chatId: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };
  
  // Handle saving the edited chat title
  const handleEditSave = (chatId: string) => {
    if (editingTitle.trim()) {
      onUpdateChatTitle(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
  };
  
  // Handle pressing Enter to save or Escape to cancel editing
  const handleEditKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      handleEditSave(chatId);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
    }
  };
  
  // Handle clicking delete button
  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    
    // If we're confirming this chat, proceed with delete
    if (confirmDelete === chatId) {
      onDeleteChat(chatId);
      setConfirmDelete(null);
    } else {
      // Otherwise, set this chat for confirmation
      setConfirmDelete(chatId);
      
      // Auto-clear confirmation after 3 seconds
      setTimeout(() => {
        setConfirmDelete(null);
      }, 3000);
    }
  };
  
  // Format a date string for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Within the last week
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
      return date.toLocaleDateString(undefined, { weekday: 'long' });
    }
    
    // Default format
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  return (
    <aside className="flex h-screen flex-col bg-gradient-to-b from-gray-900 via-gray-850 to-gray-800 text-white w-full shadow-xl">
      {/* Logo and Sidebar header */}
      <div className="p-4 border-b border-blue-900/40 bg-gradient-to-br from-gray-900 to-blue-900/40">
        <div className="flex items-center mb-5">
          <div className="w-11 h-11 mr-3 relative flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="LegacyCore Logo" 
              width={44} 
              height={44} 
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="font-bold text-xl text-white">Agent AI</h2>
            <p className="text-xs text-blue-200/70 font-light">Powered by LegacyCore</p>
          </div>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-lg border border-blue-500/30"
        >
          <PlusCircle size={18} className="mr-2" />
          <span className="font-medium">New Chat</span>
        </button>
      </div>
      
      {/* User profile */}
      {user && (
        <div className="border-b border-blue-900/20 p-4 bg-gray-800/40">
          <div className="flex items-center">
            {user.avatar_url ? (
              <Image 
                src={user.avatar_url} 
                alt={user.user_metadata?.name || 'User'} 
                width={38} 
                height={38} 
                className="rounded-full mr-3 ring-2 ring-blue-500/30 border border-white/10"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-md border border-white/10">
                <span className="text-sm font-semibold text-white">
                  {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="text-sm truncate">
              <p className="font-semibold text-white">{user.user_metadata?.name || 'Agent'}</p>
              <p className="text-gray-300 text-xs truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Search input */}
      <div className="p-4 border-b border-blue-900/20 bg-gray-800/20">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-blue-300/70" />
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            className="block w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-700/60 border border-blue-500/20 focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 focus:outline-none text-sm transition-all duration-200 text-white shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600/40 scrollbar-track-gray-800/40">
        {filteredChats.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/80 mb-4">
              <Search size={24} className="text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-300">
              {searchTerm ? 'No chats match your search' : 'No chats yet'}
            </p>
            <p className="text-xs text-blue-300/50 mt-1">
              {searchTerm ? 'Try another search term' : 'Start a new conversation'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-blue-900/10">
            {filteredChats.map((chat) => (
              <div 
                key={chat.id}
                className={`relative ${
                  activeChat === chat.id 
                    ? 'bg-blue-600/20 border-l-4 border-l-blue-500' 
                    : 'hover:bg-gray-700/40 border-l-4 border-l-transparent'
                } transition-all duration-200 cursor-pointer`}
                onMouseEnter={() => setHoveredChat(chat.id)}
                onMouseLeave={() => {
                  setHoveredChat(null);
                  if (!confirmDelete) {
                    setConfirmDelete(null);
                  }
                }}
              >
                <div 
                  className="px-4 py-3.5"
                  onClick={() => onChatSelect(chat.id)}
                >
                  <div className="flex justify-between items-start">
                    {editingChatId === chat.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleEditSave(chat.id)}
                        onKeyDown={(e) => handleEditKeyDown(e, chat.id)}
                        autoFocus
                        className="flex-1 px-2 py-1 mr-2 bg-gray-700 text-white border border-blue-500/30 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h3 className="font-medium text-sm truncate text-white" style={{ maxWidth: '80%' }}>
                        {chat.title || 'New Chat'}
                      </h3>
                    )}
                    
                    <span className="text-xs text-blue-300/70">
                      {formatDate(chat.createdAt)}
                    </span>
                  </div>
                  
                  {!editingChatId && (
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {chat.messages.length > 0 
                        ? chat.messages[chat.messages.length - 1].content.substring(0, 50) + (
                            chat.messages[chat.messages.length - 1].content.length > 50 ? '...' : ''
                          )
                        : 'No messages yet'
                      }
                    </p>
                  )}
                  
                  {/* Action buttons that show on hover */}
                  {(hoveredChat === chat.id || confirmDelete === chat.id) && !editingChatId && (
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      {confirmDelete === chat.id ? (
                        <div className="flex items-center bg-gray-900/90 rounded-lg overflow-hidden shadow-lg border border-gray-700/50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                              setConfirmDelete(null);
                            }}
                            className="px-2 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white flex items-center"
                            title="Confirm Delete"
                          >
                            <Check size={14} className="mr-1" />
                            Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(null);
                            }}
                            className="px-2 py-1.5 text-xs bg-gray-700 hover:bg-gray-800 text-white flex items-center"
                            title="Cancel"
                          >
                            <X size={14} className="mr-1" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={(e) => handleEditStart(e, chat.id, chat.title)}
                            className="p-1.5 rounded-full bg-gray-800/80 hover:bg-blue-600/80 text-gray-400 hover:text-white transition-all duration-200"
                            title="Edit Chat Title"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, chat.id)}
                            className="p-1.5 rounded-full bg-gray-800/80 hover:bg-red-600/80 text-gray-400 hover:text-white transition-all duration-200"
                            title="Delete Chat"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Version info */}
      <div className="p-3 text-center border-t border-blue-900/30 text-xs text-gray-500 bg-gradient-to-t from-gray-900 to-gray-800/70">
        <p>LegacyCore Agent AI v1.0</p>
      </div>
    </aside>
  );
}; 