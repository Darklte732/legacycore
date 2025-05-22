'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronRight, PlayCircle, Clock, Filter, Search } from 'lucide-react';
import { useState } from 'react';

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const tutorialCategories = [
    { id: 'all', name: 'All Tutorials' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'applications', name: 'Applications' },
    { id: 'commissions', name: 'Commission Management' },
    { id: 'reporting', name: 'Reporting' },
    { id: 'advanced', name: 'Advanced Features' }
  ];
  
  const tutorials = [
    {
      id: 1,
      title: "Getting Started with LegacyCore",
      description: "Learn the basics of navigating the LegacyCore platform and setting up your account.",
      thumbnail: "/images/tutorial-getting-started.jpg",
      category: "getting-started",
      duration: "5:42",
      difficulty: "Beginner"
    },
    {
      id: 2,
      title: "Creating Your First Insurance Application",
      description: "A step-by-step guide to creating and submitting your first insurance application in the system.",
      thumbnail: "/images/tutorial-application.jpg",
      category: "applications",
      duration: "8:15",
      difficulty: "Beginner"
    },
    {
      id: 3,
      title: "Managing Client Information",
      description: "Learn how to add, edit, and organize client information for better relationship management.",
      thumbnail: "/images/tutorial-clients.jpg",
      category: "getting-started",
      duration: "6:30",
      difficulty: "Beginner"
    },
    {
      id: 4,
      title: "Tracking Commissions and Payments",
      description: "Discover the tools for tracking your commission earnings and reconciling payments.",
      thumbnail: "/images/tutorial-commissions.jpg",
      category: "commissions",
      duration: "10:18",
      difficulty: "Intermediate"
    },
    {
      id: 5,
      title: "Generating Custom Reports",
      description: "Learn how to create, customize, and export reports to analyze your business performance.",
      thumbnail: "/images/tutorial-reports.jpg",
      category: "reporting",
      duration: "12:45",
      difficulty: "Intermediate"
    },
    {
      id: 6,
      title: "Setting Up Automated Workflows",
      description: "Streamline your processes by setting up automated workflows and notifications.",
      thumbnail: "/images/tutorial-automation.jpg",
      category: "advanced",
      duration: "15:22",
      difficulty: "Advanced"
    },
    {
      id: 7,
      title: "Managing Team Members and Permissions",
      description: "Learn how to add team members to your account and manage their access permissions.",
      thumbnail: "/images/tutorial-team.jpg",
      category: "getting-started",
      duration: "7:55",
      difficulty: "Intermediate"
    },
    {
      id: 8,
      title: "Advanced Application Management",
      description: "Master advanced techniques for managing multiple applications and tracking their status.",
      thumbnail: "/images/tutorial-advanced-applications.jpg",
      category: "applications",
      duration: "14:10",
      difficulty: "Advanced"
    }
  ];
  
  const filteredTutorials = activeFilter === 'all' 
    ? tutorials 
    : tutorials.filter(tutorial => tutorial.category === activeFilter);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would search the tutorials
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Video Tutorials</h1>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-10">
            <p className="text-lg text-gray-700">
              Learn how to make the most of LegacyCore with our step-by-step video tutorials. From basic navigation to advanced features, we've got you covered.
            </p>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="md:flex-1">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search tutorials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 px-4 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </form>
              </div>
              
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700 mr-3">Filter:</span>
                <div className="flex flex-wrap gap-2">
                  {tutorialCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveFilter(category.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        activeFilter === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Featured Tutorial */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 mb-10">
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <div className="w-full h-80 bg-gray-800 flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-white opacity-80" />
                </div>
              </div>
              <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                FEATURED
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">Getting Started</span>
                <span className="mx-2">·</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>20:15</span>
                <span className="mx-2">·</span>
                <span>Beginner</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Complete LegacyCore Platform Overview
              </h2>
              <p className="text-gray-700 mb-4">
                A comprehensive overview of the LegacyCore platform, covering all major features and how they work together to streamline your insurance business operations. Perfect for new users who want to quickly understand the platform's capabilities.
              </p>
              <Link 
                href="/tutorials/platform-overview" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Watch Tutorial <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          {/* Tutorials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredTutorials.map(tutorial => (
              <div key={tutorial.id} className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                      <PlayCircle className="h-12 w-12 text-white opacity-80" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {tutorial.duration}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                      {tutorialCategories.find(cat => cat.id === tutorial.category)?.name || tutorial.category}
                    </span>
                    <span className="mx-2">·</span>
                    <span>{tutorial.difficulty}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {tutorial.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tutorial.description}
                  </p>
                  <Link 
                    href={`/tutorials/${tutorial.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center"
                  >
                    Watch Tutorial <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Can't Find Section */}
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Can't Find What You're Looking For?</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              If you need help with something that's not covered in our tutorials, our support team is ready to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/support" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all">
                Contact Support
              </Link>
              <Link href="/documentation" className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all">
                Browse Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 