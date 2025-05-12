'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutUsPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About LegacyCore</h1>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <p className="text-lg text-gray-700">
              LegacyCore is the premier insurance management platform helping agents and managers streamline their operations and grow their business.
            </p>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            Our mission is to simplify the complexities of insurance management, giving professionals the tools they need to focus on what matters most: building relationships with clients and growing their business.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Story</h2>
          <p className="text-gray-700 mb-6">
            Founded in 2020 by a team of insurance industry veterans and technology experts, LegacyCore was born from the frustration of using outdated, disconnected systems to manage the modern insurance business.
          </p>
          <p className="text-gray-700 mb-6">
            After years of relying on spreadsheets, paper forms, and multiple software tools that didn't communicate with each other, our founders decided to build the all-in-one platform they wished they had. The result is LegacyCore: a comprehensive, user-friendly solution designed specifically for the needs of insurance professionals.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-700">We continuously seek new ways to improve our platform and solve the evolving challenges faced by insurance professionals.</p>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Simplicity</h3>
              <p className="text-gray-700">We believe powerful software doesn't have to be complicated. We focus on intuitive design that makes complex tasks simple.</p>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reliability</h3>
              <p className="text-gray-700">Insurance professionals depend on our platform daily. We're committed to providing a stable, secure, and dependable service.</p>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Support</h3>
              <p className="text-gray-700">We provide exceptional support to ensure our users get the most from our platform and can resolve issues quickly.</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Meet Our Leadership Team</h2>
          <p className="text-gray-700 mb-8">
            Our leadership team brings together decades of experience in insurance, technology, and customer service.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900">Sarah Johnson</h3>
              <p className="text-gray-600">Co-Founder & CEO</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900">Michael Rodriguez</h3>
              <p className="text-gray-600">Co-Founder & CTO</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900">Jennifer Williams</h3>
              <p className="text-gray-600">Chief Insurance Officer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 