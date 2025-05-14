'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState('mission');
  const [showFullStory, setShowFullStory] = useState(false);
  const [likes, setLikes] = useState({ innovation: 0, simplicity: 0, reliability: 0, support: 0 });

  const handleLike = (value: keyof typeof likes) => {
    setLikes(prev => ({
      ...prev,
      [value]: prev[value] + 1
    }));
  };

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
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 mb-6">About LegacyCore</h1>
          
          <div className="bg-white p-8 rounded-xl shadow-lg mb-10 transform transition-all duration-300 hover:shadow-xl">
            <p className="text-xl text-gray-700 leading-relaxed">
              LegacyCore is the premier insurance management platform helping agents and managers streamline their operations and grow their business.
            </p>
          </div>
          
          <div className="flex overflow-x-auto space-x-2 mb-8 pb-2">
            <button 
              onClick={() => setActiveTab('mission')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'mission' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Our Mission
            </button>
            <button 
              onClick={() => setActiveTab('story')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'story' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Our Story
            </button>
            <button 
              onClick={() => setActiveTab('values')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'values' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Our Values
            </button>
          </div>
          
          <div className="mt-8">
            {activeTab === 'mission' && (
              <div className="bg-white rounded-xl p-8 shadow-md animate-fadeIn">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Our mission is to simplify the complexities of insurance management, giving professionals the tools they need to focus on what matters most: building relationships with clients and growing their business.
                </p>
                <div className="flex items-center justify-center mt-8">
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-3/4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                  </div>
                  <span className="ml-4 text-blue-600 font-bold">75%</span>
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">of insurance professionals report significant time savings with LegacyCore</p>
              </div>
            )}
            
            {activeTab === 'story' && (
              <div className="bg-white rounded-xl p-8 shadow-md animate-fadeIn">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Founded in 2020 by a team of insurance industry veterans and technology experts, LegacyCore was born from the frustration of using outdated, disconnected systems to manage the modern insurance business.
                </p>
                
                {showFullStory ? (
                  <>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                      After years of relying on spreadsheets, paper forms, and multiple software tools that didn't communicate with each other, our founders decided to build the all-in-one platform they wished they had. The result is LegacyCore: a comprehensive, user-friendly solution designed specifically for the needs of insurance professionals.
                    </p>
                    <button 
                      onClick={() => setShowFullStory(false)}
                      className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                    >
                      Show Less
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setShowFullStory(true)}
                    className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                  >
                    Read More
                  </button>
                )}
                
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                      3
                    </div>
                    <span className="text-gray-700">Years of Growth</span>
                  </div>
                  <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                      5K+
                    </div>
                    <span className="text-gray-700">Happy Users</span>
                  </div>
                  <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                      24/7
                    </div>
                    <span className="text-gray-700">Support</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'values' && (
              <div className="animate-fadeIn">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Values</h2>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
                    <p className="text-gray-700 mb-4">We continuously seek new ways to improve our platform and solve the evolving challenges faced by insurance professionals.</p>
                    <button 
                      onClick={() => handleLike('innovation')}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {likes.innovation > 0 && <span>{likes.innovation}</span>}
                    </button>
                  </div>
                  <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Simplicity</h3>
                    <p className="text-gray-700 mb-4">We believe powerful software doesn't have to be complicated. We focus on intuitive design that makes complex tasks simple.</p>
                    <button 
                      onClick={() => handleLike('simplicity')}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {likes.simplicity > 0 && <span>{likes.simplicity}</span>}
                    </button>
                  </div>
                  <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Reliability</h3>
                    <p className="text-gray-700 mb-4">Insurance professionals depend on our platform daily. We're committed to providing a stable, secure, and dependable service.</p>
                    <button 
                      onClick={() => handleLike('reliability')}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {likes.reliability > 0 && <span>{likes.reliability}</span>}
                    </button>
                  </div>
                  <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Support</h3>
                    <p className="text-gray-700 mb-4">We provide exceptional support to ensure our users get the most from our platform and can resolve issues quickly.</p>
                    <button 
                      onClick={() => handleLike('support')}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {likes.support > 0 && <span>{likes.support}</span>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-12 bg-indigo-50 rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Join the LegacyCore Community</h2>
            <p className="text-gray-700 mb-6">
              Connect with other insurance professionals and stay updated on the latest features and industry trends.
            </p>
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