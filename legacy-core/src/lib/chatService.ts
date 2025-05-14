import { createClient } from './supabase/client'
import { v4 as uuidv4 } from 'uuid'

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

// Mock chat for demo when database tables don't exist
const MOCK_CHATS = [
  {
    id: uuidv4(),
    title: 'Demo Chat (Database Setup Required)',
    messages: [
      {
        role: 'assistant' as const,
        content: 'Welcome to the AI chat! This is a demo chat because your database tables need to be set up. Please run the migrations to enable full functionality.',
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  }
];

const supabase = createClient()

const isTableExistsError = (error: any) => {
  return error && 
    (error.code === '42P01' || // PostgreSQL table does not exist
     error.message?.includes('does not exist') || 
     error.message?.toLowerCase().includes('relation') && error.message?.toLowerCase().includes('does not exist'));
}

export const chatService = {
  // Get all chats for the current user
  async getChats(): Promise<Chat[]> {
    try {
      const { data: chats, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching chats:', error)
        
        // Return mock chats if the table doesn't exist
        if (isTableExistsError(error)) {
          console.log('Chats table does not exist, returning mock data')
          return MOCK_CHATS
        }
        
        return []
      }
      
      // For each chat, get its messages
      const chatsWithMessages = await Promise.all(chats.map(async (chat) => {
        try {
          const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: true })
          
          if (messagesError) {
            console.error(`Error fetching messages for chat ${chat.id}:`, messagesError)
            return {
              id: chat.id,
              title: chat.title,
              messages: [],
              createdAt: chat.created_at
            }
          }
          
          return {
            id: chat.id,
            title: chat.title,
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.created_at
            })),
            createdAt: chat.created_at
          }
        } catch (err) {
          console.error(`Error processing chat ${chat.id}:`, err)
          return {
            id: chat.id,
            title: chat.title,
            messages: [],
            createdAt: chat.created_at
          }
        }
      }))
      
      return chatsWithMessages
    } catch (err) {
      console.error('Unexpected error in getChats:', err)
      return MOCK_CHATS
    }
  },
  
  // Create a new chat
  async createChat(firstMessage: string = ''): Promise<Chat | null> {
    try {
      // Generate a default title based on first message or timestamp
      const title = firstMessage
        ? firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '')
        : `New chat ${new Date().toLocaleDateString()}`
      
      // Get current user ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (!userId) {
        console.error('No user ID found');
        return null;
      }
      
      const { data: chat, error } = await supabase
        .from('chats')
        .insert({
          title,
          user_id: userId,
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating chat:', error)
        
        // Return a mock chat if the table doesn't exist
        if (isTableExistsError(error)) {
          console.log('Chats table does not exist, returning mock chat')
          return MOCK_CHATS[0]
        }
        
        return null
      }
      
      // Return the new chat
      return {
        id: chat.id,
        title: chat.title,
        messages: [],
        createdAt: chat.created_at
      }
    } catch (err) {
      console.error('Unexpected error in createChat:', err)
      return MOCK_CHATS[0]
    }
  },
  
  // Get a specific chat with messages
  async getChat(chatId: string): Promise<Chat | null> {
    try {
      // Return mock chat if the ID matches a mock chat
      if (MOCK_CHATS.some(chat => chat.id === chatId)) {
        return MOCK_CHATS.find(chat => chat.id === chatId) || null
      }
      
      const { data: chat, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single()
      
      if (error) {
        console.error(`Error fetching chat ${chatId}:`, error)
        
        // Return mock chat if the table doesn't exist
        if (isTableExistsError(error)) {
          console.log('Chats table does not exist, returning mock chat')
          return MOCK_CHATS[0]
        }
        
        return null
      }
      
      try {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true })
        
        if (messagesError) {
          console.error(`Error fetching messages for chat ${chatId}:`, messagesError)
          
          // Return chat without messages if the table doesn't exist
          if (isTableExistsError(messagesError)) {
            return {
              id: chat.id,
              title: chat.title,
              messages: [],
              createdAt: chat.created_at
            }
          }
          
          return {
            id: chat.id,
            title: chat.title,
            messages: [],
            createdAt: chat.created_at
          }
        }
        
        return {
          id: chat.id,
          title: chat.title,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.created_at
          })),
          createdAt: chat.created_at
        }
      } catch (err) {
        console.error(`Error processing messages for chat ${chatId}:`, err)
        return {
          id: chat.id,
          title: chat.title,
          messages: [],
          createdAt: chat.created_at
        }
      }
    } catch (err) {
      console.error(`Unexpected error in getChat:`, err)
      return MOCK_CHATS[0]
    }
  },
  
  // Add a message to a chat
  async addMessage(chatId: string, message: Message): Promise<boolean> {
    try {
      // For mock chats, just return true
      if (MOCK_CHATS.some(chat => chat.id === chatId)) {
        console.log('Mock chat detected, simulating successful message add')
        return true
      }
      
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          role: message.role,
          content: message.content,
          created_at: message.timestamp || new Date().toISOString()
        })
      
      if (error) {
        console.error(`Error adding message to chat ${chatId}:`, error)
        return false
      }
      
      // Update the chat's updated_at timestamp
      const { error: updateError } = await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId)
      
      if (updateError) {
        console.error(`Error updating chat timestamp for ${chatId}:`, updateError)
        // Continue anyway as the message was added successfully
      }
      
      return true
    } catch (err) {
      console.error(`Unexpected error in addMessage:`, err)
      return false
    }
  },
  
  // Delete a chat and all its messages
  async deleteChat(chatId: string): Promise<boolean> {
    try {
      // For mock chats, just return true
      if (MOCK_CHATS.some(chat => chat.id === chatId)) {
        console.log('Mock chat detected, simulating successful deletion')
        return true
      }
      
      // First delete all messages associated with this chat
      const { error: messagesError, count } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId)
      
      if (messagesError) {
        console.error(`Error deleting messages for chat ${chatId}:`, messagesError)
        // Continue anyway to try to delete the chat
      } else {
        console.log(`Successfully deleted ${count} messages for chat ${chatId}`)
      }
      
      // Then delete the chat itself
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)
      
      if (error) {
        console.error(`Error deleting chat ${chatId}:`, error)
        return false
      }
      
      console.log(`Successfully deleted chat ${chatId}`)
      return true
    } catch (err) {
      console.error(`Unexpected error in deleteChat:`, err)
      return false
    }
  },
  
  // Update chat title
  async updateChatTitle(chatId: string, title: string): Promise<boolean> {
    try {
      // For mock chats, just return true
      if (MOCK_CHATS.some(chat => chat.id === chatId)) {
        console.log('Mock chat detected, simulating successful title update')
        return true
      }
      
      const { error } = await supabase
        .from('chats')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', chatId)
      
      if (error) {
        console.error(`Error updating title for chat ${chatId}:`, error)
        return false
      }
      
      return true
    } catch (err) {
      console.error(`Unexpected error in updateChatTitle:`, err)
      return false
    }
  },
  
  // Delete a specific message from a chat
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      // For mock chats, just return true
      if (MOCK_CHATS.some(chat => chat.messages.some(msg => msg.id === messageId))) {
        console.log('Mock message detected, simulating successful deletion')
        return true
      }
      
      // Delete the specific message
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
      
      if (error) {
        console.error(`Error deleting message ${messageId}:`, error)
        return false
      }
      
      console.log(`Successfully deleted message ${messageId}`)
      return true
    } catch (err) {
      console.error(`Unexpected error in deleteMessage:`, err)
      return false
    }
  }
} 