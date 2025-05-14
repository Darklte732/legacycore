'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronRight, Calendar, User, Clock, Tag } from 'lucide-react';
import { useState } from 'react';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const blogPosts = [
    {
      id: 1,
      title: "Revolutionizing Insurance Management with Technology",
      excerpt: "Discover how insurance agencies are leveraging technology to streamline operations and improve client experiences.",
      coverImage: "/images/blog-tech.jpg",
      date: "October 15, 2023",
      author: "Sarah Johnson",
      readTime: "5 min read",
      category: "Technology"
    },
    {
      id: 2,
      title: "5 Ways to Boost Your Insurance Agency's Productivity",
      excerpt: "Learn proven strategies to enhance workflow efficiency and maximize your agency's output without burning out your team.",
      coverImage: "/images/blog-productivity.jpg",
      date: "September 28, 2023",
      author: "Michael Rodriguez",
      readTime: "7 min read",
      category: "Productivity"
    },
    {
      id: 3,
      title: "Understanding Commission Structures in the Modern Insurance Industry",
      excerpt: "A comprehensive guide to navigating complex commission structures and maximizing your earnings as an insurance agent.",
      coverImage: "/images/blog-commission.jpg",
      date: "September 10, 2023",
      author: "Jennifer Williams",
      readTime: "8 min read",
      category: "Finance"
    },
    {
      id: 4,
      title: "The Future of Insurance Sales: AI and Automation",
      excerpt: "Explore how artificial intelligence and automation are transforming the insurance sales process and what it means for agents.",
      coverImage: "/images/blog-ai.jpg",
      date: "August 22, 2023",
      author: "David Chen",
      readTime: "6 min read",
      category: "Technology"
    },
    {
      id: 5,
      title: "Building Client Trust in the Digital Age",
      excerpt: "Strategies for establishing and maintaining strong client relationships when face-to-face interactions are limited.",
      coverImage: "/images/blog-trust.jpg",
      date: "August 5, 2023",
      author: "Lisa Martinez",
      readTime: "4 min read",
      category: "Client Relations"
    },
    {
      id: 6,
      title: "Navigating Regulatory Changes in the Insurance Industry",
      excerpt: "Stay informed about the latest regulatory updates and learn how to adapt your business practices accordingly.",
      coverImage: "/images/blog-regulations.jpg",
      date: "July 19, 2023",
      author: "Robert Thompson",
      readTime: "9 min read",
      category: "Compliance"
    }
  ];
  
  const categories = [
    "All Categories",
    "Technology",
    "Productivity",
    "Finance",
    "Client Relations",
    "Compliance",
    "Marketing"
  ];
  
  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would search the blog
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Blog</h1>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-10">
            <p className="text-lg text-gray-700">
              Insights, tips, and news about insurance management, technology, and growing your business.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-10 mb-16">
            <div className="md:w-3/4">
              {/* Featured Post */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 mb-10">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">Featured post image</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">Featured</span>
                    <span className="mx-2">·</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>November 2, 2023</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    <Link href="/blog/the-complete-guide-to-insurance-agency-management-in-2023" className="hover:text-blue-600 transition-colors">
                      The Complete Guide to Insurance Agency Management in 2023
                    </Link>
                  </h2>
                  <p className="text-gray-700 mb-4">
                    As we approach 2024, insurance agency management continues to evolve with new technologies, changing client expectations, and shifting market dynamics. This comprehensive guide covers everything agency owners and managers need to know to stay competitive and grow their business.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Alex Johnson</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>12 min read</span>
                        </div>
                      </div>
                    </div>
                    <Link href="/blog/the-complete-guide-to-insurance-agency-management-in-2023" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                      Read more <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Blog Posts Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {blogPosts.map((post) => (
                  <div key={post.id} className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">Post image</p>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{post.date}</span>
                        <span className="mx-2">·</span>
                        <Tag className="h-3 w-3 mr-1" />
                        <span>{post.category}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        <Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-gray-700 text-sm mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1 text-gray-500" />
                          <span className="text-xs text-gray-500">{post.author}</span>
                          <span className="mx-2 text-gray-300">|</span>
                          <Clock className="h-3 w-3 mr-1 text-gray-500" />
                          <span className="text-xs text-gray-500">{post.readTime}</span>
                        </div>
                        <Link href={`/blog/${post.id}`} className="text-blue-600 hover:text-blue-700 font-medium text-xs flex items-center">
                          Read <ChevronRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              <div className="flex justify-center mt-10">
                <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-current="page"
                    className="relative inline-flex items-center px-4 py-2 border border-blue-500 bg-blue-50 text-sm font-medium text-blue-600"
                  >
                    1
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    2
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    3
                  </a>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    8
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </nav>
              </div>
            </div>
            
            <div className="md:w-1/4">
              {/* Search Widget */}
              <div className="bg-white shadow-sm rounded-lg p-5 border border-gray-200 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Search</h3>
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-2 text-gray-400 hover:text-blue-600"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Categories Widget */}
              <div className="bg-white shadow-sm rounded-lg p-5 border border-gray-200 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
                <ul className="space-y-2">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <Link href={`/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`} className={`block py-1 px-2 rounded-md ${index === 0 ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                        {category}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Popular Posts Widget */}
              <div className="bg-white shadow-sm rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Posts</h3>
                <ul className="space-y-4">
                  {blogPosts.slice(0, 3).map((post) => (
                    <li key={post.id} className="flex items-start">
                      <div className="w-16 h-16 bg-gray-200 flex-shrink-0 mr-3"></div>
                      <div>
                        <Link href={`/blog/${post.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Newsletter Signup */}
          <div className="bg-blue-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-3">Subscribe to Our Newsletter</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Stay up to date with the latest industry news, tips, and insights delivered straight to your inbox.
            </p>
            <form className="max-w-md mx-auto flex items-center">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow py-3 px-4 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white py-3 px-6 rounded-r-lg font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 