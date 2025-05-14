"use client";

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// Mock implementation of a chat service
const chatService = {
  // Get all chat sessions for the current user
  getSessions: async (): Promise<ChatSession[]> => {
    if (typeof window === 'undefined') return [];
    
    return JSON.parse(localStorage.getItem('chat_sessions') || '[]');
  },

  // Alias for getSessions to maintain compatibility
  getChats: async (): Promise<ChatSession[]> => {
    if (typeof window === 'undefined') return [];
    
    return JSON.parse(localStorage.getItem('chat_sessions') || '[]');
  },

  // Get a specific chat session by ID
  getSession: async (sessionId: string): Promise<ChatSession | null> => {
    if (typeof window === 'undefined') return null;
    
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    return sessions.find((session: ChatSession) => session.id === sessionId) || null;
  },

  // Alias for getSession
  getChat: async (chatId: string): Promise<ChatSession | null> => {
    if (typeof window === 'undefined') return null;
    
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    return sessions.find((session: ChatSession) => session.id === chatId) || null;
  },

  // Create a new chat session
  createSession: async (title: string = 'New Chat'): Promise<ChatSession> => {
    if (typeof window === 'undefined') {
      return {
        id: Date.now().toString(),
        title,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    const newSession = {
      id: Date.now().toString(),
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('chat_sessions', JSON.stringify([newSession, ...sessions]));
    return newSession;
  },

  // Alias for createSession
  createChat: async (title: string = 'New Chat'): Promise<ChatSession> => {
    return chatService.createSession(title);
  },

  // Add a message to a chat
  addMessage: async (chatId: string, message: Message): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    const sessionIndex = sessions.findIndex((s: ChatSession) => s.id === chatId);
    
    if (sessionIndex === -1) return false;
    
    // Add an ID if one doesn't exist
    const messageWithId = {
      ...message,
      id: message.id || `msg-${Date.now()}-${message.role}`
    };
    
    sessions[sessionIndex].messages.push(messageWithId);
    sessions[sessionIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    return true;
  },

  // Send a message in a chat session
  sendMessage: async (sessionId: string, content: string): Promise<Message> => {
    if (typeof window === 'undefined') {
      return {
        id: `msg-${Date.now()}-assistant`,
        content: `This is a mock response to: "${content}"`,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
    }
    
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    const sessionIndex = sessions.findIndex((s: ChatSession) => s.id === sessionId);
    
    if (sessionIndex === -1) {
      throw new Error('Chat session not found');
    }
    
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      content,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    // Mock assistant response
    const assistantMessage: Message = {
      id: `msg-${Date.now()}-assistant`,
      content: `This is a mock response to: "${content}"`,
      role: 'assistant',
      timestamp: new Date().toISOString()
    };
    
    sessions[sessionIndex].messages.push(userMessage, assistantMessage);
    sessions[sessionIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    
    return assistantMessage;
  },

  // Delete a chat session
  deleteSession: async (sessionId: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    const updatedSessions = sessions.filter((s: ChatSession) => s.id !== sessionId);
    localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
    
    return true;
  },

  // Alias for deleteSession
  deleteChat: async (chatId: string): Promise<boolean> => {
    return chatService.deleteSession(chatId);
  },

  // Update chat title
  updateChatTitle: async (chatId: string, newTitle: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    const sessionIndex = sessions.findIndex((s: ChatSession) => s.id === chatId);
    
    if (sessionIndex === -1) return false;
    
    sessions[sessionIndex].title = newTitle;
    sessions[sessionIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    return true;
  },

  // Delete a message from a chat
  deleteMessage: async (messageId: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    let found = false;
    
    const updatedSessions = sessions.map((chat: ChatSession) => {
      const updatedMessages = chat.messages.filter(msg => {
        if (msg.id === messageId) {
          found = true;
          return false;
        }
        return true;
      });
      
      if (found) {
        return {
          ...chat,
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        };
      }
      
      return chat;
    });
    
    if (!found) return false;
    
    localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
    return true;
  }
};

// Export as both default and named export for compatibility
export { chatService };
export default chatService; 