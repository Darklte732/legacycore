"use client"

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './components/ChatInterface.css';
import { Sidebar } from "./components/sidebar";
import DailyInspiration from "./components/DailyInspiration";
import useUserSession from '@/hooks/useUserSession';
import chatService from '@/lib/chatService';
import { Message } from './components/message'
import { formatResponse } from './utils/formatResponse';

// Add custom CSS styles
const messageStyles = `
  .message-content p {
    margin-bottom: 0.75rem;
  }
  
  .message-content ul, .message-content ol {
    margin-left: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .message-content li {
    margin-bottom: 0.25rem;
  }
  
  .message-content h1, .message-content h2, .message-content h3 {
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .message-content blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    font-style: italic;
    margin: 0.75rem 0;
  }
  
  .message-content pre {
    background-color: #f3f4f6;
    padding: 0.75rem;
    border-radius: 0.25rem;
    overflow-x: auto;
    margin: 0.75rem 0;
  }
  
  .message-content code {
    background-color: #f3f4f6;
    padding: 0.25rem;
    border-radius: 0.25rem;
    font-family: monospace;
  }
  
  .message-content table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.75rem 0;
  }
  
  .message-content th, .message-content td {
    border: 1px solid #e5e7eb;
    padding: 0.5rem;
    text-align: left;
  }
  
  .message-content th {
    background-color: #f9fafb;
  }
  
  .key-point {
    font-weight: 600;
    color: #1e40af;
  }
  
  .list-item {
    display: block;
    padding-left: 1.5rem;
    position: relative;
    margin-bottom: 0.5rem;
  }
  
  .list-item:before {
    content: "•";
    position: absolute;
    left: 0.5rem;
  }
`;

const AIChatPage = () => {
  const { user, loading: userLoading } = useUserSession();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mobileSidebarRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  
  // Initialize session ID and webhook URL
  const [sessionId, setSessionId] = useState<string>('');
  const webhookUrl = 'https://n8n-mybh5-u38603.vm.elestio.app/webhook/AICHAT';
  
  // Add a debugging state to show counts
  const [debugInfo, setDebugInfo] = useState({
    messageCount: 0,
    lastAction: 'Initial load'
  });
  
  // Mobile sidebar toggle
  const toggleMobileSidebar = () => {
    if (mobileSidebarRef.current && backdropRef.current) {
      mobileSidebarRef.current.classList.toggle('translate-x-0');
      backdropRef.current.classList.toggle('opacity-0');
      backdropRef.current.classList.toggle('pointer-events-none');
    }
  };
  
  // Fetch user's chats when component mounts or user changes
  useEffect(() => {
    if (userLoading) return;
    
    const loadChats = async () => {
      if (!user) {
        setChats([]);
        setLoadingChats(false);
        return;
      }
      
      setLoadingChats(true);
      try {
        const userChats = await chatService.getChats();
        setChats(userChats);
        
        // If we have chats and no active chat, set the first one as active
        if (userChats.length > 0 && !activeChat) {
          setActiveChat(userChats[0].id);
          setMessages(userChats[0].messages);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoadingChats(false);
      }
    };
    
    loadChats();
  }, [user, userLoading]);
  
  // Initialize with a unique session ID
  useEffect(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    
    // Scroll to the bottom when component mounts
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      const scrollToBottom = () => {
        const scrollElement = chatContainerRef.current;
        if (scrollElement) {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: 'smooth'
          });
        }
      };
      
      // Small timeout to ensure DOM has updated
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, isLoading]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Focus input when pressing / key (when not already focused)
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Helper function to improve message formatting 
  const formatResponseText = (text: string): string => {
    if (!text) return '';
    
    return text
      // Add proper spacing after periods for paragraph breaks (when followed by a capital letter)
      .replace(/\.([A-Z])/g, '.\n\n$1')
      
      // Format numbered lists - find patterns like "1. Item" or "1) Item" and add proper formatting
      .replace(/(\d+[\.\)])\s+([^\n]+)/g, '\n$1 $2\n')
      
      // Format bullet lists
      .replace(/(\*|\-|\•)\s+([^\n]+)/g, '\n$1 $2\n')
      
      // Add spacing after multiple paragraphs that already have newlines
      .replace(/\n{2,}/g, '\n\n')
      
      // Ensure proper spacing around headers (lines with # at the start)
      .replace(/\n?(#+\s+[^\n]+)\n?/g, '\n\n$1\n\n')
      
      // Clean up any excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      
      // Trim to remove any leading/trailing whitespace
      .trim();
  };

  // Parse the response content, handling JSON and raw text
  const parseResponseContent = (responseData) => {
    console.log('Parsing response data (raw):', responseData);
    
    // Check if it's already a string
    if (typeof responseData === 'string') {
      console.log('Response is a string, attempting to parse as JSON');
      try {
        // Try parsing it as JSON first (in case it's a JSON string)
        const parsedJson = JSON.parse(responseData);
        console.log('Successfully parsed as JSON:', parsedJson);
        // If successfully parsed, extract content from the JSON
        
        // Common patterns in n8n responses
        if (parsedJson.output) {
          console.log('Found output field:', parsedJson.output);
          if (typeof parsedJson.output === 'string') return parsedJson.output;
          if (typeof parsedJson.output === 'object') return JSON.stringify(parsedJson.output);
        }
        
        if (parsedJson.response) {
          console.log('Found response field:', parsedJson.response);
          return parsedJson.response;
        }
        if (parsedJson.message) {
          console.log('Found message field:', parsedJson.message);
          return parsedJson.message;
        }
        if (parsedJson.content) {
          console.log('Found content field:', parsedJson.content);
          return parsedJson.content;
        }
        if (parsedJson.text) {
          console.log('Found text field:', parsedJson.text);
          return parsedJson.text;
        }
        
        // Return the stringified object as a fallback
        console.log('No standard fields found, returning full JSON');
        return JSON.stringify(parsedJson);
      } catch (e) {
        // It's not JSON, just return the string as is
        console.log('Not valid JSON, returning as string');
        return responseData;
      }
    }
    
    // If it's an object, try to extract the content
    if (typeof responseData === 'object' && responseData !== null) {
      console.log('Response is an object, searching for content fields');
      // Common patterns in n8n responses
      if (responseData.output) {
        console.log('Found output field in object:', responseData.output);
        if (typeof responseData.output === 'string') return responseData.output;
        if (typeof responseData.output === 'object') return JSON.stringify(responseData.output);
      }
      
      if (responseData.response) {
        console.log('Found response field in object:', responseData.response);
        return responseData.response;
      }
      if (responseData.message) {
        console.log('Found message field in object:', responseData.message);
        return responseData.message;
      }
      if (responseData.content) {
        console.log('Found content field in object:', responseData.content);
        return responseData.content;
      }
      if (responseData.text) {
        console.log('Found text field in object:', responseData.text);
        return responseData.text;
      }
      
      // For n8n responses that might be arrays
      if (Array.isArray(responseData) && responseData.length > 0) {
        console.log('Response is an array, checking first item');
        const firstItem = responseData[0];
        if (typeof firstItem === 'string') return firstItem;
        if (typeof firstItem === 'object') {
          if (firstItem.response) return firstItem.response;
          if (firstItem.message) return firstItem.message;
          if (firstItem.content) return firstItem.content;
          if (firstItem.text) return firstItem.text;
        }
        return JSON.stringify(firstItem);
      }
      
      // Last resort - stringify the object
      try {
        console.log('No standard fields found in object, stringifying full object');
        return JSON.stringify(responseData);
      } catch (e) {
        return "Could not process response data";
      }
    }
    
    // Fallback - convert to string
    console.log('Using fallback string conversion');
    return String(responseData || "No response received");
  };

  // Clean up "list-item" strings that might appear in the content
  const cleanupListItems = (text) => {
    if (!text) return '';
    
    console.log('Cleaning up list items, original text:', text);
    
    let result = text;
    
    // First, replace any exact matching patterns like those in our example
    const examplePattern = /"list-item">(\d+\.\s+[^<\n]+)/g;
    if (examplePattern.test(result)) {
      result = result.replace(examplePattern, '<div class="list-item"><strong>$1</strong></div>');
    }
    
    // Then do more general patterns
    result = result
      .replace(/"list-item">([^<\n]+)/g, '<div class="list-item">$1</div>')
      .replace(/^"list-item">(.+)$/gm, '<div class="list-item">$1</div>');
    
    console.log('Cleaned up list items, result:', result);
    return result;
  };

  const fixFormattingIssues = (content) => {
    if (!content) return '';
    
    console.log('Original content before formatting:', content);
    
    // Make sure content is a string before applying string methods
    let stringContent = '';
    if (typeof content === 'string') {
      stringContent = content;
    } else if (content.data && typeof content.data === 'string') {
      stringContent = content.data;
    } else if (content.success && content.data) {
      // Try to extract data from success response
      if (typeof content.data === 'string') {
        stringContent = content.data;
      } else if (content.data.response) {
        stringContent = content.data.response;
      } else if (content.data.output) {
        stringContent = content.data.output;
      } else {
        // Fallback to stringifying the object
        try {
          stringContent = JSON.stringify(content.data);
        } catch (e) {
          stringContent = "Unable to display response";
        }
      }
    } else {
      // If it's not a string and doesn't have expected structure, stringify it
      try {
        stringContent = JSON.stringify(content);
      } catch (e) {
        stringContent = "Unable to display response";
      }
    }
    
    // Add an escape hatch for error messages
    if (stringContent.includes("I apologize") || stringContent.includes("Error:") || stringContent.includes("sorry")) {
      return stringContent;
    }
    
    // Format plain text content with more attractive HTML
    const formattedContent = stringContent
      // Format numbered lists
      .replace(/\n?(\d+[\.\)])\s+([^\n]+)/g, '<div class="list-item"><strong>$1</strong> $2</div>')
      // Format bullet lists
      .replace(/\n?(\*|\-|\•)\s+([^\n]+)/g, '<div class="list-item">$2</div>')
      // Format headers
      .replace(/\n?(#+)\s+([^\n]+)/g, (_, hashes, text) => {
        const level = hashes.length;
        const size = level === 1 ? 'xl' : level === 2 ? 'lg' : 'md';
        return `<div class="font-bold text-${size} my-3 text-teal-300">${text}</div>`;
      })
      // Convert plain text newlines to <br> tags
      .replace(/\n/g, '<br>')
      // Format key phrases and quoted text
      .replace(/"([^"]+)"/g, (match, content) => {
        return `<span class="text-indigo-300 font-medium">"${content}"</span>`;
      })
      // Style important points
      .replace(/!(Important|Note|Warning|Tip):/gi, '<strong class="text-yellow-300">$1:</strong>')
      // Format code blocks and inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-700 rounded px-1 py-0.5 text-sm">$1</code>')
      // Make links clickable
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-400 underline">$1</a>');
    
    console.log('Formatted content after processing:', formattedContent);
    return formattedContent;
  };

  // Update the webhook connection to ensure proper formatting and headers
  const connectToWebhook = async (message, sessionId) => {
    console.log('Attempting to connect to webhook with:', { message, sessionId });
    
    try {
      // Use fetch API instead of axios to avoid header issues
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message,
          sessionId,
          agentId: user?.id || '',
          timestamp: new Date().toISOString()
        })
      });

      console.log('Webhook response status:', response.status);
      
      if (response.status >= 200 && response.status < 300) {
        const data = await response.json().catch(() => ({}));
        console.log('Webhook raw response data:', data);
        
        return {
          success: true,
          data
        };
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`Webhook error: ${response.status}`, errorText);
        
        return {
          success: false,
          error: `Webhook error: ${response.status}`,
          details: errorText
        };
      }
    } catch (error) {
      console.error('Webhook connection error:', error);
      
      return {
        success: false,
        error: 'Failed to connect to webhook',
        details: error.message || 'Unknown error occurred'
      };
    }
  };

  // Create new chat
  const handleCreateNewChat = async () => {
    if (!user) return;
    
    try {
      // Create new chat in Supabase
      const newChat = await chatService.createChat();
      
      if (!newChat) {
        console.error('Failed to create new chat');
        return;
      }
      
      // Update local state
      setChats([newChat, ...chats]);
      setActiveChat(newChat.id);
      setMessages([]);
      
      // Reset debug info
      setDebugInfo({
        messageCount: 0,
        lastAction: 'Created new chat'
      });
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };
  
  // Handle chat selection
  const handleChatSelect = async (chatId: string) => {
    setActiveChat(chatId);
    
    // Find the chat in our local state first for immediate display
    const selectedChat = chats.find(chat => chat.id === chatId);
    
    if (selectedChat) {
      setMessages(selectedChat.messages);
    } else {
      // If not in local state, fetch from Supabase
      const chat = await chatService.getChat(chatId);
      if (chat) {
        setMessages(chat.messages);
      }
    }
    
    setDebugInfo({
      messageCount: selectedChat?.messages.length || 0,
      lastAction: 'Selected chat'
    });
  };
  
  // Handle chat deletion
  const handleDeleteChat = async (chatId: string) => {
    // Optimistic update - remove from UI first
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    // If we're deleting the active chat, select a new one
    if (activeChat === chatId) {
      if (updatedChats.length > 0) {
        setActiveChat(updatedChats[0].id);
        setMessages(updatedChats[0].messages);
      } else {
        setActiveChat(null);
        setMessages([]);
      }
    }
    
    // Delete from Supabase
    try {
      console.log(`Attempting to delete chat ${chatId} and its messages...`);
      const success = await chatService.deleteChat(chatId);
      
      if (!success) {
        // If deletion failed, restore the chat in UI
        console.error('Failed to delete chat from Supabase');
        // Refetch chats to restore correct state
        const refreshedChats = await chatService.getChats();
        setChats(refreshedChats);
        
        if (activeChat === chatId && refreshedChats.some(c => c.id === chatId)) {
          // The chat we tried to delete still exists, make sure it's selected
          setActiveChat(chatId);
          const currentChat = refreshedChats.find(c => c.id === chatId);
          if (currentChat) {
            setMessages(currentChat.messages);
          }
        }
      } else {
        console.log(`Successfully deleted chat ${chatId}`);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Add a handler function for updating chat titles
  const handleUpdateChatTitle = async (chatId: string, newTitle: string) => {
    // Update the title in Supabase
    const success = await chatService.updateChatTitle(chatId, newTitle);
    
    if (success) {
      // Update the chat in our local state
      const updatedChats = chats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            title: newTitle
          };
        }
        return chat;
      });
      setChats(updatedChats);
    }
  };

  // Simplified message handler for testing
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Create new chat if we don't have an active one
    if (!activeChat) {
      const newChat = await chatService.createChat(inputValue);
      if (newChat) {
        setActiveChat(newChat.id);
        setChats([newChat, ...chats]);
      } else {
        console.error("Failed to create new chat");
        return;
      }
    }
    
    // Set loading state
    setIsLoading(true);
    
    // Get the chat ID (either existing or newly created)
    const chatId = activeChat;
    
    // Add user message to UI immediately for responsiveness
    const userMessage: Message = { 
      role: 'user', 
      content: inputValue, 
      timestamp: new Date().toISOString()
    };
    
    // Create a copy of the messages array with the new user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Save user message to database
    await chatService.addMessage(chatId, userMessage);
    
    // Clear input field
    setInputValue('');
    
    // Update debug info
    setDebugInfo({
      messageCount: updatedMessages.length,
      lastAction: 'Added user message'
    });
    
    try {
      // Send the message to the webhook
      const response = await connectToWebhook(inputValue, sessionId);
      
      if (response) {
        // Extract content from the response
        let responseContent;
        
        if (response.success && response.data) {
          if (typeof response.data === 'string') {
            responseContent = response.data;
          } else if (response.data.response) {
            responseContent = response.data.response;
          } else if (response.data.output) {
            responseContent = response.data.output;
          } else if (response.data.text) {
            responseContent = response.data.text;
          } else if (response.data.message) {
            responseContent = response.data.message;
          } else {
            // Try to stringify the response
            try {
              responseContent = JSON.stringify(response.data);
            } catch (e) {
              responseContent = "Received data in an unexpected format.";
            }
          }
        } else if (response.error) {
          responseContent = `Error: ${response.error}. ${response.details || ''}`;
        } else {
          responseContent = "No readable response received from the assistant.";
        }
        
        // Format the response using our smart formatting utility
        const formattedContent = formatResponse(responseContent);
        
        // Create an assistant message with the response
        const assistantMessage: Message = {
          role: 'assistant',
          content: formattedContent,
          timestamp: new Date().toISOString()
        };
      
        // Update the messages state with the assistant's response
        const messagesWithResponse = [...updatedMessages, assistantMessage];
        setMessages(messagesWithResponse);
        
        // Save the assistant message to the database
        await chatService.addMessage(chatId, assistantMessage);
        
        // Update debug info
        setDebugInfo({
          messageCount: messagesWithResponse.length,
          lastAction: 'Added assistant response'
        });
        
        // Check if this is the first message pair and update chat title if needed
        if (updatedMessages.length === 1) {
          const chatTitle = inputValue.length > 30 
            ? `${inputValue.substring(0, 30)}...` 
            : inputValue;
          
          await chatService.updateChatTitle(chatId, chatTitle);
          
          // Update the chat in our local state too
          const updatedChats = chats.map(chat => {
            if (chat.id === chatId) {
            return {
              ...chat,
                title: chatTitle,
                messages: messagesWithResponse
            };
          }
          return chat;
        });
          
          setChats(updatedChats);
        } else {
          // Just update the messages in our local chat state
          const updatedChats = chats.map(chat => {
            if (chat.id === chatId) {
            return {
              ...chat,
                messages: messagesWithResponse
            };
          }
          return chat;
        });
          
          setChats(updatedChats);
        }
      }
    } catch (error) {
      console.error('Error sending message to webhook:', error);
      
      // Add error message to the UI
      const errorMessage: Message = {
        role: 'assistant', 
        content: 'I apologize, but I encountered an error while processing your request. Please try again later.',
        timestamp: new Date().toISOString()
      };
      
      // Update the messages state with the error response
      const messagesWithError = [...updatedMessages, errorMessage];
      setMessages(messagesWithError);
      
      // Save the error message to the database
      await chatService.addMessage(chatId, errorMessage);
    } finally {
      // End loading state
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setInputValue('');
    }
  };

  // Process the webhook response
  const handleWebhookResponse = async (result: string) => {
    // ...existing implementation...
  };

  // Handle deleting an individual message
  const handleDeleteMessage = async (messageId: string) => {
    if (!activeChat) return;
    
    try {
      console.log(`Attempting to delete message ${messageId}...`);
      
      // Delete the message from the database
      const success = await chatService.deleteMessage(messageId);
      
      if (success) {
        console.log(`Successfully deleted message ${messageId}`);
        
        // Update local state - filter out the deleted message
        const updatedMessages = messages.filter(msg => msg.id !== messageId);
        setMessages(updatedMessages);
        
        // Update the messages in the corresponding chat object
        const updatedChats = chats.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
              messages: chat.messages.filter(msg => msg.id !== messageId)
          };
        }
        return chat;
      });
      
        setChats(updatedChats);
        
        // Update debug info
      setDebugInfo({
          messageCount: updatedMessages.length,
          lastAction: 'Deleted message'
        });
      } else {
        console.error(`Failed to delete message ${messageId}`);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Debug Panel (hidden in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-800 p-2 text-xs text-gray-400 flex justify-between items-center border-b border-gray-700">
          <div>
            Debug: Messages: {debugInfo.messageCount}, Last action: {debugInfo.lastAction}
          </div>
          <div>
            Session ID: {sessionId.substring(0, 8)}...
          </div>
        </div>
      )}
      
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-800 hidden lg:block overflow-hidden">
        <Sidebar 
          chats={chats}
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
          onNewChat={handleCreateNewChat}
          onDeleteChat={handleDeleteChat}
          onUpdateChatTitle={handleUpdateChatTitle}
        />
      </div>
      
        {/* Main chat area */}
        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Mobile header with menu button */}
          <div className="lg:hidden bg-gray-800 p-4 flex items-center border-b border-gray-700">
            <button 
              onClick={() => setShowMobileSidebar(true)}
              className="p-2 mr-2 rounded hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1 className="text-xl font-semibold">LegacyChat</h1>
          </div>
          
          {/* Messages area with scroll */}
          <div className="flex-grow overflow-y-auto" ref={chatContainerRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                <h3 className="text-xl font-bold mb-2">Welcome to LegacyChat</h3>
                <p className="text-gray-400 max-w-md">
                  Ask me anything about insurance, policies, or how I can assist you with your clients.
                </p>
                  </div>
            ) : (
              <div>
                {messages.map((message, index) => (
                  <Message 
                    key={`${activeChat}-${index}`}
                    id={message.id} // Pass the message ID for deletion
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                    onDelete={handleDeleteMessage} // Add the delete handler
                  />
                ))}
                
                {/* "Thinking" indicator when loading a response */}
                {isLoading && (
                  <div className="px-4 py-3 flex justify-start">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-teal-600 text-white mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <circle cx="15.5" cy="8.5" r="1.5"></circle>
                        <path d="M8.5 14a4 4 0 0 0 7 0"></path>
                      </svg>
                    </div>
                    <div className="max-w-[75%] bg-gray-800 text-gray-100 rounded-lg px-4 py-3 shadow-md">
                      <div className="flex items-center space-x-2">
                        <div className="typing-indicator">
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                        </div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}
      </div>
      
          {/* Input area */}
          <div className="border-t border-gray-800 p-4">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-grow relative">
                <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
            placeholder="Type your message..."
                  rows={1}
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white resize-none"
          />
              </div>
          <button
            type="submit"
                disabled={isLoading || !inputValue.trim()}
                className={`p-3 rounded-lg ${
                  isLoading || !inputValue.trim()
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } transition-colors`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
          </button>
        </form>
          </div>
      </div>
      
        {/* Mobile sidebar (drawer) */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowMobileSidebar(false)}
            ></div>
            
            {/* Sidebar drawer */}
            <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 z-50 shadow-xl">
        <Sidebar 
          chats={chats}
          activeChat={activeChat}
                onChatSelect={(chatId) => {
                  handleChatSelect(chatId);
                  setShowMobileSidebar(false);
          }}
          onNewChat={() => {
            handleCreateNewChat();
                  setShowMobileSidebar(false);
          }}
          onDeleteChat={handleDeleteChat}
          onUpdateChatTitle={handleUpdateChatTitle}
        />
      </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AIChatPage;