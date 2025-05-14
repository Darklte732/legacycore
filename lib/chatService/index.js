"use client";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
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
export const chatService = {
  // Get all chat sessions for the current user
  getSessions: async (): Promise<ChatSession[]> => {
    if (typeof window === 'undefined') return [];
    
    return JSON.parse(localStorage.getItem('chat_sessions') || '[]');
  },

  // Get a specific chat session by ID
  getSession: async (sessionId: string): Promise<ChatSession | null> => {
    if (typeof window === 'undefined') return null;
    
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    return sessions.find((session: ChatSession) => session.id === sessionId) || null;
  },

  // Create a new chat session
  createSession: async (title: string): Promise<ChatSession> => {
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
    
    localStorage.setItem('chat_sessions', JSON.stringify([...sessions, newSession]));
    return newSession;
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
  deleteSession: async (sessionId: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    const updatedSessions = sessions.filter((s: ChatSession) => s.id !== sessionId);
    localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
  }
};

// Export as both default and named export for compatibility
export default chatService; 