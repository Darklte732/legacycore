'use client';

import Link from 'next/link';
import { ArrowLeft, LifeBuoy, Mail, Phone, FileText, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('support-request');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    urgency: 'normal',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

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

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>
        
        <div className="prose max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Support Center</h1>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-10">
            <p className="text-lg text-gray-700">
              Need help with LegacyCore? Our support team is here to assist you. Browse our FAQ or contact us directly.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Support Options</h3>
                  <ul className="space-y-2">
                    <li>
                      <button 
                        onClick={() => setActiveTab('support-request')}
                        className={`w-full text-left py-2 px-3 rounded ${activeTab === 'support-request' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Support Request
                        </div>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setActiveTab('faq')}
                        className={`w-full text-left py-2 px-3 rounded ${activeTab === 'faq' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center">
                          <LifeBuoy className="h-4 w-4 mr-2" />
                          FAQ
                        </div>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setActiveTab('contact-info')}
                        className={`w-full text-left py-2 px-3 rounded ${activeTab === 'contact-info' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Information
                        </div>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setActiveTab('documentation')}
                        className={`w-full text-left py-2 px-3 rounded ${activeTab === 'documentation' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Documentation
                        </div>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-3">
              {activeTab === 'support-request' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit a Support Request</h2>
                  
                  {submitted ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-green-700 mb-2">Request Submitted!</h3>
                      <p className="text-green-600 mb-4">Your support request has been received. Our team will respond to you as soon as possible.</p>
                      <p className="text-green-600">Reference number: <strong>SR-{Math.floor(Math.random() * 100000)}</strong></p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Please describe your issue in detail..."
                          ></textarea>
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all"
                      >
                        Submit Request
                      </button>
                    </form>
                  )}
                </div>
              )}
              
              {activeTab === 'faq' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  
                  <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    {faqItems.map((item, index) => (
                      <div key={index} className={`border-b border-gray-200 ${index === faqItems.length - 1 ? 'border-b-0' : ''}`}>
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{item.question}</h3>
                          <p className="text-gray-700">{item.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 text-center">
                    <p className="text-gray-700 mb-4">Can't find what you're looking for?</p>
                    <button
                      onClick={() => setActiveTab('support-request')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all"
                    >
                      Submit a Support Request
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'contact-info' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <Mail className="h-5 w-5 text-blue-600 mr-3" />
                        <h3 className="text-lg font-bold text-gray-900">Email Support</h3>
                      </div>
                      <p className="text-gray-700 mb-2">General Support:</p>
                      <a href="mailto:support@legacycore.com" className="text-blue-600 hover:text-blue-700">support@legacycore.com</a>
                      
                      <p className="text-gray-700 mb-2 mt-4">Technical Support:</p>
                      <a href="mailto:tech@legacycore.com" className="text-blue-600 hover:text-blue-700">tech@legacycore.com</a>
                      
                      <p className="text-gray-700 mb-2 mt-4">Billing Support:</p>
                      <a href="mailto:billing@legacycore.com" className="text-blue-600 hover:text-blue-700">billing@legacycore.com</a>
                    </div>
                    
                    <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <Phone className="h-5 w-5 text-blue-600 mr-3" />
                        <h3 className="text-lg font-bold text-gray-900">Phone Support</h3>
                      </div>
                      <p className="text-gray-700 mb-2">Customer Service:</p>
                      <a href="tel:+18005551234" className="text-blue-600 hover:text-blue-700">(800) 555-1234</a>
                      <p className="text-gray-500 text-sm mt-1">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                      
                      <p className="text-gray-700 mb-2 mt-4">Technical Support:</p>
                      <a href="tel:+18005555678" className="text-blue-600 hover:text-blue-700">(800) 555-5678</a>
                      <p className="text-gray-500 text-sm mt-1">24/7 Emergency Support</p>
                      
                      <p className="text-gray-700 mb-2 mt-4">Billing Department:</p>
                      <a href="tel:+18005559876" className="text-blue-600 hover:text-blue-700">(800) 555-9876</a>
                      <p className="text-gray-500 text-sm mt-1">Monday - Friday: 9:00 AM - 5:00 PM EST</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Live Chat Support</h3>
                    <p className="text-gray-700 mb-4">
                      Our live chat support is available during business hours. Click the chat icon in the bottom right corner of any page when logged in to start a conversation with our support team.
                    </p>
                    <p className="text-gray-700">
                      <strong>Live Chat Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
                    </p>
                  </div>
                </div>
              )}
              
              {activeTab === 'documentation' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Documentation Resources</h2>
                  
                  <div className="grid grid-cols-1 gap-6 mb-8">
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Product Documentation</h3>
                        <p className="text-gray-700 mb-4">
                          Browse our comprehensive documentation for detailed information on all LegacyCore features and functionalities.
                        </p>
                        <Link href="/documentation" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                          View Documentation <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                        </Link>
                      </div>
                    </div>
                    
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Video Tutorials</h3>
                        <p className="text-gray-700 mb-4">
                          Watch step-by-step video tutorials covering all aspects of the LegacyCore platform.
                        </p>
                        <Link href="/documentation/video-tutorials" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                          View Video Tutorials <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                        </Link>
                      </div>
                    </div>
                    
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">API Documentation</h3>
                        <p className="text-gray-700 mb-4">
                          Integrate with LegacyCore using our robust API. Find detailed documentation, code examples, and integration guides.
                        </p>
                        <Link href="/documentation/api-reference" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
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
      </div>
    </div>
  );
} 