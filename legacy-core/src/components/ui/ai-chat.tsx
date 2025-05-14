"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { ScrollArea } from "./scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { Loader2, Image, FileCode, Code, Copy, CheckCheck, Star, MessageSquare, Plus, Upload, BookOpen, Settings, User, Bell, PieChart, FileText, Filter, Download, Clock, ExternalLink, Menu, MessageCircle, BookMarked, Search } from "lucide-react"
import { useUserSession } from '@/hooks/useUserSession';
import { formatResponse } from '@/app/agent/ai-chat/utils/formatResponse';

interface Message {
  role: "assistant" | "user"
  content: string
  timestamp: Date
  artifacts?: {
    type: "code" | "image" | "diagram"
    content: string
  }[]
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  isStarred: boolean
  category?: "prospect" | "client" | "training" | "general" | "carrier"
  associatedClient?: string
}

interface AIChatProps {
  initialMessage?: string
  placeholder?: string
}

export function AIChat({ 
  initialMessage = "👋 Hello! I'm your AI assistant for LegacyCore. I can help you with questions about applications, policies, carriers, and client management. What can I assist you with today?",
  placeholder = "Type your insurance or application question here..."
}: AIChatProps) {
  // Get user session 
  const { user } = useUserSession();
  
  // Chat history state
  const [chats, setChats] = useState<Chat[]>(() => {
    // Initialize with one chat
    const initialChat: Chat = {
      id: "initial-chat",
      title: "New chat",
      messages: [
        {
          role: "assistant",
          content: initialMessage,
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      isStarred: false,
      category: "general"
    };
    
    // Try to load chats from localStorage
    const savedChats = typeof window !== 'undefined' ? localStorage.getItem('aiChats') : null;
    return savedChats ? JSON.parse(savedChats) : [initialChat];
  });
  
  const [activeChat, setActiveChat] = useState<string>(chats[0]?.id || "initial-chat");
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [sidebarView, setSidebarView] = useState<"chats" | "templates" | "settings">("templates")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Generate a unique session ID if not already set
  const [sessionId] = useState<string>(() => {
    // Try to get existing sessionId from localStorage
    const existingSessionId = typeof window !== 'undefined' ? localStorage.getItem('chatSessionId') : null;
    
    if (existingSessionId) {
      return existingSessionId;
    }
    
    // Generate a new sessionId
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatSessionId', newSessionId);
    }
    
    return newSessionId;
  });
  
  // Get current chat
  const currentChat = chats.find(chat => chat.id === activeChat) || chats[0];
  const messages = currentChat?.messages || [];
  
  // Quick template responses for insurance agents
  const quickTemplates = [
    { 
      title: "Final Expense Basics", 
      content: "Could you explain the basic features and benefits of final expense insurance for a new client?" 
    },
    { 
      title: "Policy Comparison", 
      content: "Can you help me compare the key differences between Term and Whole Life for final expense coverage?" 
    },
    { 
      title: "Underwriting Guide", 
      content: "What are the typical health questions on final expense applications for seniors with diabetes?" 
    },
    { 
      title: "Client Objection", 
      content: "How should I respond when a client says they already have enough coverage through their employer?" 
    },
    { 
      title: "Premium Calculation", 
      content: "What factors determine the premium rates for final expense policies?" 
    }
  ];
  
  // Save chats to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiChats', JSON.stringify(chats));
    }
  }, [chats]);

  // Simulate scrolling to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  // Create a new chat
  const createNewChat = () => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: "New chat",
      messages: [
        {
          role: "assistant",
          content: initialMessage,
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      isStarred: false,
      category: "general"
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };
  
  // Toggle star status of a chat
  const toggleStar = (chatId: string) => {
    setChats(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, isStarred: !chat.isStarred } 
          : chat
      )
    );
  };
  
  // Update chat title based on first user message
  const updateChatTitle = (chatId: string, userMessage: string) => {
    // Only update if it's still the default "New chat" title
    setChats(prev => 
      prev.map(chat => {
        if (chat.id === chatId && chat.title === "New chat") {
          // Create a title from user message (truncate if too long)
          const newTitle = userMessage.length > 30 
            ? userMessage.substring(0, 30) + "..." 
            : userMessage;
          return { ...chat, title: newTitle };
        }
        return chat;
      })
    );
  };
  
  // Update chat category
  const updateChatCategory = (chatId: string, category: Chat['category']) => {
    setChats(prev => 
      prev.map(chat => 
        chat.id === chatId ? { ...chat, category } : chat
      )
    );
  };

  // Filter chats by category
  const filteredChats = filterCategory 
    ? chats.filter(chat => chat.category === filterCategory)
    : chats;

  // Sample responses for fallback
  const sampleResponses = [
    "To check application status, go to the 'All Applications' tab and look for the status column. You can filter by clicking on the 'Pending', 'Approved', or 'Declined' tabs as well.",
    "Term life insurance typically covers a specific period (10, 20, or 30 years) and pays a death benefit if the insured passes away during that term. Whole life insurance provides coverage for the insured's entire lifetime and includes a cash value component.",
    "To add a new client, click the 'New Application' button in the top right corner of this page. You'll need basic information like name, contact details, and policy preferences.",
    "For most carriers, the underwriting process takes 2-4 weeks after all medical exams and paperwork are completed. Some carriers offer accelerated underwriting that can be completed in days.",
    "The best way to explain premium differences to clients is to focus on the value and coverage they're receiving. Compare the benefits, term length, and coverage amount to help them understand the price difference.",
    "Yes, clients can typically convert term policies to permanent coverage within a specific conversion period without additional medical underwriting. Check with the specific carrier for their conversion options."
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() === "") return

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    }
    
    // Update chat with user message
    setChats(prev => 
      prev.map(chat => {
        if (chat.id === activeChat) {
          return { 
            ...chat, 
            messages: [...chat.messages, userMessage]
          };
        }
        return chat;
      })
    );
    
    // Update chat title if it's the first user message
    if (messages.length === 1 && messages[0].role === "assistant") {
      updateChatTitle(activeChat, input);
    }
    
    setInput("")
    setIsLoading(true)

    try {
      console.log("Sending message:", input);
      
      // Use our local API proxy instead of directly calling n8n
      const payload = {
        message: input,
        userId: "agent-user",
        agentId: user?.id || '',
        timestamp: new Date().toISOString(),
        sessionId: sessionId,
        chatId: activeChat
      };
      
      console.log("Payload:", JSON.stringify(payload));
      
      // POST to our local API endpoint that will forward to n8n
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      console.log("API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Parse the JSON response from our API
      const data = await response.json();
      console.log("API response data:", data);
      
      // Get response text from data
      let responseText = "";
      if (data && typeof data === 'object') {
        if (data.response) {
          // Check if response is a string that begins with "Response:"
          if (typeof data.response === 'string' && data.response.startsWith('Response:')) {
            // Extract the JSON content after "Response:"
            try {
              const jsonContent = data.response.substring(data.response.indexOf('{'));
              const parsedContent = JSON.parse(jsonContent);
              responseText = parsedContent.output || parsedContent.text || parsedContent.message || parsedContent.content || jsonContent;
            } catch (e) {
              // If parsing fails, just remove the "Response:" prefix
              responseText = data.response.replace(/^Response:\s*/, '');
            }
          } else {
            responseText = data.response;
          }
        } else if (data.text || data.message || data.content) {
          responseText = data.text || data.message || data.content;
        } else if (data.output) {
          responseText = data.output;
        } else {
          responseText = "I received your message, but I'm not sure how to respond. Please try again.";
        }
      } else if (typeof data === 'string') {
        responseText = data;
      } else {
        responseText = "Received an unexpected response format.";
      }
      
      // Format the response using our smart formatting utility
      const formattedContent = formatResponse(responseText);
      
      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: formattedContent,
        timestamp: new Date()
      };
      
      setChats(prev => 
        prev.map(chat => {
          if (chat.id === activeChat) {
            return { 
              ...chat, 
              messages: [...chat.messages, assistantMessage]
            };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error("Error calling API:", error);
      
      // Use clear error message instead of random response
      const fallbackMessage: Message = {
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting to my knowledge service. Please check your connection and try again.",
        timestamp: new Date()
      }
      
      setChats(prev => 
        prev.map(chat => {
          if (chat.id === activeChat) {
            return { 
              ...chat, 
              messages: [...chat.messages, fallbackMessage]
            };
          }
          return chat;
        })
      );
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle template selection
  const useTemplate = (template: string) => {
    setInput(template);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  // Render code with syntax highlighting
  const renderContent = (content: string) => {
    // Simple code block detection (can be improved with a proper markdown parser)
    if (content.includes("```")) {
      const parts = content.split("```");
      return (
        <>
          {parts.map((part, index) => {
            if (index % 2 === 0) {
              return <p key={index}>{part}</p>;
            } else {
              const language = part.split("\n")[0];
              const code = part.split("\n").slice(1).join("\n");
              return (
                <div key={index} className="relative my-4 rounded-md bg-gray-900 p-4">
                  <div className="absolute right-2 top-2">
                    <Button
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(code)}
                      className="h-8 w-8 rounded-full p-0"
                    >
                      {isCopied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{language || "code"}</div>
                  <pre className="text-sm text-white overflow-x-auto whitespace-pre-wrap">
                    <code>{code}</code>
                  </pre>
                </div>
              );
            }
          })}
        </>
      );
    }
    return <p>{content}</p>;
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow border">
      {/* Main chat container layout */}
      <div className="w-full flex flex-col">
        {/* Header with title and buttons */}
        <div className="flex justify-between items-center px-4 py-2 border-b bg-[#0a2a4a] text-white">
          <h2 className="font-medium">AI Chat Assistant</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-[#1c4b73]">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-[#1c4b73]">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-[#1c4b73]">
              <Clock className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main content area - split into sidebar and chat area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-[240px] border-r flex flex-col bg-[#0a2a4a]">
            {/* New chat button */}
            <Button 
              onClick={createNewChat}
              className="m-3 flex items-center justify-center gap-2 bg-[#8b2232] hover:bg-[#a02b3d] text-white"
            >
              <Plus className="h-4 w-4" /> New chat
            </Button>
            
            {/* Tabs for sidebar content */}
            <div className="flex border-b border-[#153d5d]">
              <button 
                className={`flex-1 py-2 text-xs font-medium border-b-2 ${sidebarView === 'chats' ? 'border-[#8b2232] text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                onClick={() => setSidebarView('chats')}
              >
                Chats
              </button>
              <button 
                className={`flex-1 py-2 text-xs font-medium border-b-2 ${sidebarView === 'templates' ? 'border-[#8b2232] text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                onClick={() => setSidebarView('templates')}
              >
                Templates
              </button>
              <button 
                className={`flex-1 py-2 text-xs font-medium border-b-2 ${sidebarView === 'settings' ? 'border-[#8b2232] text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                onClick={() => setSidebarView('settings')}
              >
                Settings
              </button>
            </div>
            
            {/* Content of sidebar based on active tab */}
            <ScrollArea className="flex-1">
              {sidebarView === 'chats' && (
                <div className="px-2 py-3">
                  {filteredChats.map(chat => (
                    <div 
                      key={chat.id}
                      className={`flex items-center justify-between p-2 text-sm rounded cursor-pointer group mb-1 hover:bg-[#153d5d] ${activeChat === chat.id ? 'bg-[#153d5d]' : ''}`}
                      onClick={() => setActiveChat(chat.id)}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="truncate text-gray-100">{chat.title}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(chat.id);
                        }}
                        className={`opacity-0 group-hover:opacity-100 ${chat.isStarred ? 'opacity-100' : ''}`}
                      >
                        <Star className={`h-4 w-4 ${chat.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {sidebarView === 'templates' && (
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-300">Quick Templates</div>
                  {quickTemplates.map((template, index) => (
                    <div 
                      key={index}
                      className="px-3 py-2 border-b border-[#153d5d] cursor-pointer hover:bg-[#153d5d]"
                      onClick={() => useTemplate(template.content)}
                    >
                      <div className="font-medium text-sm text-gray-100 mb-1">{template.title}</div>
                      <div className="text-xs text-gray-400">{template.content}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {sidebarView === 'settings' && (
                <div className="p-3 space-y-4">
                  <div className="text-xs font-medium text-gray-300 mb-2">Chat Settings</div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 mb-1">Categorize This Chat</div>
                    <div className="grid grid-cols-2 gap-1 mb-4">
                      {(['general', 'client', 'prospect', 'carrier', 'training'] as const).map(category => (
                        <button 
                          key={category}
                          className={`text-xs py-1 px-2 rounded ${
                            currentChat?.category === category 
                              ? 'bg-[#8b2232] text-white' 
                              : 'bg-[#153d5d] text-gray-200 hover:bg-[#1c4b73]'
                          }`}
                          onClick={() => updateChatCategory(activeChat, category)}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                      ))}
                    </div>
                    
                    <div className="border-t border-[#153d5d] pt-4">
                      <div className="text-xs text-gray-400 mb-2">Actions</div>
                      <div className="flex flex-col gap-2">
                        <button className="flex items-center gap-2 text-sm text-gray-200 p-2 hover:bg-[#153d5d] rounded">
                          <FileText className="h-4 w-4" />
                          <span>Export Conversation</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-gray-200 p-2 hover:bg-[#153d5d] rounded">
                          <User className="h-4 w-4" />
                          <span>Associate With Client</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Main chat display area */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 bg-gray-50 p-4">
              <div className="max-w-3xl mx-auto">
                {messages.map((message, index) => (
                  <div 
                    key={index}
                    className={`mb-4 ${message.role === "user" ? "flex justify-end" : ""}`}
                  >
                    <div 
                      className={`rounded-lg p-3 ${
                        message.role === "assistant" 
                          ? "bg-[#e1f0ff] border border-[#c2e0ff] text-[#0a2a4a] max-w-[80%]" 
                          : "bg-white border border-[#0a2a4a] text-[#0a2a4a] max-w-[75%]"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{renderContent(message.content)}</div>
                      <div className="text-xs mt-1 text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="mb-4">
                    <div className="rounded-lg bg-[#e1f0ff] border border-[#c2e0ff] p-3 text-sm flex items-center space-x-2 max-w-[50%] text-[#0a2a4a]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Input area */}
            <form onSubmit={handleSubmit} className="border-t p-3 bg-white">
              <div className="flex gap-2 items-center">
                <Input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 border-gray-300 focus:border-[#0a2a4a] focus:ring-1 focus:ring-[#0a2a4a]"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || input.trim() === ""}
                  className="bg-[#8b2232] hover:bg-[#a02b3d] text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M22 2 11 13"></path>
                    <path d="m22 2-7 20-4-9-9-4 20-7Z"></path>
                  </svg>
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-500">
                  AI Assistant can help with policy questions, application guidance, and client inquiries.
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500">
                    <Upload className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 