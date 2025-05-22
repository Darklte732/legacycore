'use client';

import Link from 'next/link';
import { ArrowLeft, Search, ChevronRight, BookOpen, Code, HelpCircle, Zap, FileText, DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const documentationCategories = [
    {
      title: "Getting Started",
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
      items: [
        "Platform Overview",
        "Account Setup",
        "Dashboard Navigation",
        "User Roles and Permissions",
        "Quick Start Guide"
      ]
    },
    {
      title: "Applications",
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      items: [
        "Creating Applications",
        "Application Status",
        "Client Information",
        "Document Upload",
        "Carrier Submission"
      ]
    },
    {
      title: "Commission Management",
      icon: <DollarSign className="h-5 w-5 text-blue-600" />,
      items: [
        "Commission Tracking",
        "Payment Reconciliation",
        "Commission Reports",
        "Commission Splits",
        "Payment History"
      ]
    },
    {
      title: "API Reference",
      icon: <Code className="h-5 w-5 text-blue-600" />,
      items: [
        "Authentication",
        "Endpoints",
        "Response Formats",
        "Rate Limits",
        "Webhooks"
      ]
    },
    {
      title: "Troubleshooting",
      icon: <HelpCircle className="h-5 w-5 text-blue-600" />,
      items: [
        "Common Issues",
        "Error Messages",
        "Contact Support",
        "System Status",
        "Frequently Asked Questions"
      ]
    },
    {
      title: "Best Practices",
      icon: <Zap className="h-5 w-5 text-blue-600" />,
      items: [
        "Workflow Optimization",
        "Data Management",
        "Security Guidelines",
        "Performance Tips",
        "Team Collaboration"
      ]
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would search the documentation
    console.log('Search query:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>
        
        <div className="prose max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Documentation</h1>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-10">
            <p className="text-lg text-gray-700">
              Welcome to the LegacyCore documentation. Find guides, references, and resources to help you get the most out of our platform.
            </p>
          </div>
          
          <div className="mb-10">
            <form onSubmit={handleSearch} className="flex items-center relative">
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 px-5 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute left-4">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <button
                type="submit"
                className="absolute right-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Search
              </button>
            </form>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {documentationCategories.map((category, index) => (
              <div key={index} className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  {category.icon}
                  <h3 className="text-xl font-bold text-gray-900 ml-3">{category.title}</h3>
                </div>
                <ul className="space-y-2 mb-4">
                  {category.items.map((item, i) => (
                    <li key={i}>
                      <Link href={`/documentation/${category.title.toLowerCase().replace(/\s+/g, '-')}/${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-gray-700 hover:text-blue-600 transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={`/documentation/${category.title.toLowerCase().replace(/\s+/g, '-')}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Resources</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Start Guide</h3>
              <p className="text-gray-700 mb-4">
                Get up and running with LegacyCore in less than 30 minutes with our step-by-step guide.
              </p>
              <Link href="/documentation/getting-started/quick-start-guide" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                Read guide <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">API Documentation</h3>
              <p className="text-gray-700 mb-4">
                Integrate with our platform using our comprehensive API documentation and examples.
              </p>
              <Link href="/documentation/api-reference/authentication" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                View API docs <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Video Tutorials</h3>
              <p className="text-gray-700 mb-4">
                Learn through our collection of video tutorials covering all aspects of the platform.
              </p>
              <Link href="/documentation/video-tutorials" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                Watch tutorials <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Additional Help?</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is available to help with any questions you may have about the platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/support" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all">
                Contact Support
              </Link>
              <Link href="/documentation/faq" className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all">
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 