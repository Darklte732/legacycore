'use client';

import Link from 'next/link';
import { ArrowLeft, LifeBuoy, Mail, Phone, FileText, MessageSquare, ThumbsUp, ThumbsDown, Send, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('support-request');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [feedbackRatings, setFeedbackRatings] = useState<Record<number, 'helpful' | 'unhelpful' | null>>({});
  const [activeFeedback, setActiveFeedback] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{sender: 'user' | 'agent', message: string}>>([]);
  const [chatActive, setChatActive] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    urgency: 'normal',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (chatActive) {
      // Simulate agent response after 1 second
      const timer = setTimeout(() => {
        setChatHistory([
          ...chatHistory,
          {
            sender: 'agent',
            message: 'Hi there! How can I help you with LegacyCore today?'
          }
        ]);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [chatActive]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send the form data to your server here
    console.log('Support request submitted:', formData);
    setSubmitted(true);
  };
  
  const toggleFaqItem = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };
  
  const provideFeedback = (index: number, type: 'helpful' | 'unhelpful') => {
    setFeedbackRatings({
      ...feedbackRatings,
      [index]: type
    });
    setActiveFeedback(index);
    
    // In a real app, you would send this feedback to your server
  };
  
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    setChatHistory([
      ...chatHistory,
      {
        sender: 'user',
        message: chatMessage
      }
    ]);
    setChatMessage('');
    
    // Simulate agent response after 1.5 seconds
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'agent',
          message: getRandomResponse()
        }
      ]);
    }, 1500);
  };
  
  const getRandomResponse = () => {
    const responses = [
      "I understand your question. Let me find that information for you.",
      "Thanks for reaching out! I can definitely help with that.",
      "Great question! Here's what you need to know about that feature.",
      "I'm looking into this for you. It should only take a moment.",
      "I'd be happy to help troubleshoot that issue with you."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  const faqItems = [
    {
      question: "How do I reset my password?",
      answer: "To reset your password, click on the 'Forgot Password' link on the login page. You will receive an email with instructions to reset your password. If you don't receive the email, please check your spam folder or contact support."
    },
    {
      question: "How do I add a new user to my account?",
      answer: "To add a new user, go to Settings > User Management > Add User. Fill in the required information and set the appropriate permissions. The new user will receive an email invitation to join your account."
    },
    {
      question: "How are commissions calculated?",
      answer: "Commissions are calculated based on the rates set by the carriers and your agency agreement. When a policy is issued, the commission is automatically calculated and added to your commission tracking dashboard."
    },
    {
      question: "Can I export my data from LegacyCore?",
      answer: "Yes, you can export data from most sections of the platform. Look for the 'Export' button in the top right corner of the relevant page. You can export in CSV, Excel, or PDF formats depending on the data type."
    },
    {
      question: "How do I connect my carrier accounts?",
      answer: "Go to Settings > Carrier Connections and click 'Add Carrier'. Select your carrier from the list and follow the instructions to connect your account. You may need your carrier portal credentials to complete the connection."
    }
  ];

  const filteredFaqItems = searchQuery
    ? faqItems.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-20 pb-32">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6 transition-all duration-200 hover:translate-x-[-4px]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>
        
        <div className="prose max-w-none">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 mb-6">Support Center</h1>
          
          <div className="bg-white p-8 rounded-xl shadow-lg mb-10 transform transition-all duration-300 hover:shadow-xl">
            <p className="text-xl text-gray-700 leading-relaxed">
              Need help with LegacyCore? Our support team is here to assist you. Browse our FAQ or contact us directly.
            </p>
          </div>
          
          {/* Support Navigation Tabs */}
          <div className="flex overflow-x-auto space-x-2 mb-8 pb-2">
            <button 
              onClick={() => setActiveTab('support-request')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all flex items-center ${activeTab === 'support-request' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Support Request
            </button>
            <button 
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all flex items-center ${activeTab === 'faq' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <LifeBuoy className="h-4 w-4 mr-2" /> FAQ
            </button>
            <button 
              onClick={() => setActiveTab('contact-info')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all flex items-center ${activeTab === 'contact-info' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Phone className="h-4 w-4 mr-2" /> Contact Info
            </button>
            <button 
              onClick={() => setActiveTab('documentation')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all flex items-center ${activeTab === 'documentation' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <FileText className="h-4 w-4 mr-2" /> Docs
            </button>
          </div>
          
          {/* Live Chat Bubble */}
          {!chatActive && (
            <button 
              onClick={() => setChatActive(true)}
              className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
            >
              <MessageSquare className="h-6 w-6" />
            </button>
          )}
          
          {/* Live Chat Modal */}
          {chatActive && (
            <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200">
              <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h3 className="font-bold">Live Support Chat</h3>
                <button onClick={() => setChatActive(false)} className="text-white hover:text-gray-200">
                  &times;
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                {chatHistory.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg max-w-[80%] ${
                      msg.sender === 'user' 
                        ? 'bg-blue-100 text-gray-800 self-end' 
                        : 'bg-gray-100 text-gray-800 self-start'
                    }`}
                  >
                    {msg.message}
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleChatSubmit} className="p-3 border-t border-gray-200 flex">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
          
          <div className="mt-6">
            {activeTab === 'support-request' && (
              <div className="bg-white rounded-xl p-8 shadow-md animate-fadeIn">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Submit a Support Request</h2>
                
                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.02]">
                    <h3 className="text-xl font-bold text-green-700 mb-2">Request Submitted!</h3>
                    <p className="text-green-600 mb-4">Your support request has been received. Our team will respond to you as soon as possible.</p>
                    <p className="text-green-600">Reference number: <strong>SR-{Math.floor(Math.random() * 100000)}</strong></p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: '',
                          email: '',
                          subject: '',
                          category: '',
                          urgency: 'normal',
                          message: ''
                        });
                      }}
                      className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="transform transition-all duration-300 hover:shadow-lg rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name *</label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address *</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject *</label>
                        <input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="category" className="block text-gray-700 font-medium mb-2">Category *</label>
                        <select
                          id="category"
                          name="category"
                          required
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="">Select a category</option>
                          <option value="technical">Technical Issue</option>
                          <option value="account">Account Management</option>
                          <option value="billing">Billing Question</option>
                          <option value="feature">Feature Request</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="urgency" className="block text-gray-700 font-medium mb-2">Urgency</label>
                        <select
                          id="urgency"
                          name="urgency"
                          value={formData.urgency}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      
                      <div className="col-span-2">
                        <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message *</label>
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          required
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Please describe your issue in detail..."
                        ></textarea>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5"
                    >
                      Submit Request
                    </button>
                  </form>
                )}
              </div>
            )}
            
            {activeTab === 'faq' && (
              <div className="bg-white rounded-xl p-8 shadow-md animate-fadeIn">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute left-3 top-3.5 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {filteredFaqItems.length > 0 ? (
                    filteredFaqItems.map((item, index) => (
                      <div 
                        key={index} 
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden transform transition-all duration-200 hover:shadow-md"
                      >
                        <button
                          onClick={() => toggleFaqItem(index)}
                          className="w-full text-left p-4 flex justify-between items-center focus:outline-none"
                        >
                          <h3 className="text-lg font-bold text-gray-900">{item.question}</h3>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {expandedFaq === index && (
                          <div className="p-4 pt-0 border-t border-gray-100 animate-fadeIn">
                            <p className="text-gray-700 mb-4">{item.answer}</p>
                            
                            <div className="flex items-center justify-end space-x-3 mt-2">
                              <p className="text-sm text-gray-500">Was this helpful?</p>
                              <button 
                                onClick={() => provideFeedback(index, 'helpful')}
                                className={`p-1 rounded ${feedbackRatings[index] === 'helpful' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                                disabled={feedbackRatings[index] === 'unhelpful'}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => provideFeedback(index, 'unhelpful')}
                                className={`p-1 rounded ${feedbackRatings[index] === 'unhelpful' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                                disabled={feedbackRatings[index] === 'helpful'}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </button>
                            </div>
                            
                            {feedbackRatings[index] && (
                              <div className={`mt-3 text-sm ${feedbackRatings[index] === 'helpful' ? 'text-green-600' : 'text-gray-600'}`}>
                                {feedbackRatings[index] === 'helpful' ? 
                                  'Thanks for your feedback!' : 
                                  'Thank you for your feedback. We\'ll work on improving this answer.'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-600">Try different keywords or submit a support request.</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-gray-700 mb-4">Can't find what you're looking for?</p>
                  <button
                    onClick={() => setActiveTab('support-request')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5"
                  >
                    Submit a Support Request
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'contact-info' && (
              <div className="bg-white rounded-xl p-8 shadow-md animate-fadeIn">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center mb-4">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <h3 className="text-lg font-bold text-gray-900">Email Support</h3>
                    </div>
                    <p className="text-gray-700 mb-2">General Support:</p>
                    <a href="mailto:support@legacycore.com" className="text-blue-600 hover:text-blue-700 transition-colors">support@legacycore.com</a>
                    
                    <p className="text-gray-700 mb-2 mt-4">Technical Support:</p>
                    <a href="mailto:tech@legacycore.com" className="text-blue-600 hover:text-blue-700 transition-colors">tech@legacycore.com</a>
                    
                    <p className="text-gray-700 mb-2 mt-4">Billing Support:</p>
                    <a href="mailto:billing@legacycore.com" className="text-blue-600 hover:text-blue-700 transition-colors">billing@legacycore.com</a>
                  </div>
                  
                  <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center mb-4">
                      <Phone className="h-5 w-5 text-blue-600 mr-3" />
                      <h3 className="text-lg font-bold text-gray-900">Phone Support</h3>
                    </div>
                    <p className="text-gray-700 mb-2">Customer Service:</p>
                    <a href="tel:+18005551234" className="text-blue-600 hover:text-blue-700 transition-colors">(800) 555-1234</a>
                    <p className="text-gray-500 text-sm mt-1">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                    
                    <p className="text-gray-700 mb-2 mt-4">Technical Support:</p>
                    <a href="tel:+18005555678" className="text-blue-600 hover:text-blue-700 transition-colors">(800) 555-5678</a>
                    <p className="text-gray-500 text-sm mt-1">24/7 Emergency Support</p>
                    
                    <p className="text-gray-700 mb-2 mt-4">Billing Department:</p>
                    <a href="tel:+18005559876" className="text-blue-600 hover:text-blue-700 transition-colors">(800) 555-9876</a>
                    <p className="text-gray-500 text-sm mt-1">Monday - Friday: 9:00 AM - 5:00 PM EST</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Live Chat Support</h3>
                  <p className="text-gray-700 mb-4">
                    Our live chat support is available during business hours. Click the chat icon in the bottom right corner of any page when logged in to start a conversation with our support team.
                  </p>
                  <p className="text-gray-700">
                    <strong>Live Chat Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
                  </p>
                </div>
                
                <div className="mt-8 bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Connect on Social Media</h3>
                  <div className="flex flex-wrap gap-4">
                    <a href="#" className="bg-[#1DA1F2] text-white px-5 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
                      Twitter
                    </a>
                    <a href="#" className="bg-[#4267B2] text-white px-5 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
                      Facebook
                    </a>
                    <a href="#" className="bg-[#0077B5] text-white px-5 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
                      LinkedIn
                    </a>
                    <a href="#" className="bg-[#FF4500] text-white px-5 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
                      Reddit
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'documentation' && (
              <div className="bg-white rounded-xl p-8 shadow-md animate-fadeIn">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Documentation Resources</h2>
                
                <div className="grid grid-cols-1 gap-6 mb-8">
                  <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Product Documentation</h3>
                      <p className="text-gray-700 mb-4">
                        Browse our comprehensive documentation for detailed information on all LegacyCore features and functionalities.
                      </p>
                      <Link href="/documentation" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
                        View Documentation <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Video Tutorials</h3>
                      <p className="text-gray-700 mb-4">
                        Watch step-by-step video tutorials covering all aspects of the LegacyCore platform.
                      </p>
                      <Link href="/documentation/video-tutorials" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
                        View Video Tutorials <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">API Documentation</h3>
                      <p className="text-gray-700 mb-4">
                        Integrate with LegacyCore using our robust API. Find detailed documentation, code examples, and integration guides.
                      </p>
                      <Link href="/documentation/api-reference" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
                        View API Documentation <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 