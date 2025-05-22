'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronRight, HeartHandshake, Users, Briefcase } from 'lucide-react';

export default function CareersPage() {
  const openPositions = [
    {
      title: "Senior Insurance Sales Specialist",
      department: "Sales",
      location: "Remote",
      type: "Full-time"
    },
    {
      title: "Insurance Product Manager",
      department: "Product",
      location: "New York, NY",
      type: "Full-time"
    },
    {
      title: "Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time"
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Chicago, IL",
      type: "Full-time"
    },
    {
      title: "Marketing Specialist",
      department: "Marketing",
      location: "Remote",
      type: "Full-time"
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Careers at LegacyCore</h1>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <p className="text-lg text-gray-700">
              Join our growing team and help transform the insurance industry with technology.
            </p>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-6">Why Work With Us?</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 text-center">
              <div className="flex justify-center mb-4">
                <Briefcase className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Impactful Work</h3>
              <p className="text-gray-700">Our platform helps thousands of insurance professionals grow their business and better serve their clients.</p>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Great Team</h3>
              <p className="text-gray-700">Work with passionate, talented colleagues who are committed to excellence and continuous learning.</p>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 text-center">
              <div className="flex justify-center mb-4">
                <HeartHandshake className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Growth Opportunities</h3>
              <p className="text-gray-700">Develop your skills and advance your career in a supportive environment focused on professional growth.</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Benefits & Perks</h2>
          
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-4 mb-12">
            <div className="flex items-start">
              <div className="text-green-500 mr-2 mt-1 flex-shrink-0">
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <span className="text-gray-700">Competitive salary & equity</span>
            </div>
            
            <div className="flex items-start">
              <div className="text-green-500 mr-2 mt-1 flex-shrink-0">
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <span className="text-gray-700">Comprehensive health, dental, and vision insurance</span>
            </div>
            
            <div className="flex items-start">
              <div className="text-green-500 mr-2 mt-1 flex-shrink-0">
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <span className="text-gray-700">Flexible PTO policy</span>
            </div>
            
            <div className="flex items-start">
              <div className="text-green-500 mr-2 mt-1 flex-shrink-0">
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <span className="text-gray-700">401(k) with company match</span>
            </div>
            
            <div className="flex items-start">
              <div className="text-green-500 mr-2 mt-1 flex-shrink-0">
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <span className="text-gray-700">Remote-friendly work environment</span>
            </div>
            
            <div className="flex items-start">
              <div className="text-green-500 mr-2 mt-1 flex-shrink-0">
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <span className="text-gray-700">Professional development stipend</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Open Positions</h2>
          
          {openPositions.map((position, index) => (
            <div key={index} className="border border-gray-200 rounded-lg mb-4 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{position.title}</h3>
                    <p className="text-gray-600 mt-1">{position.department} · {position.location} · {position.type}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                    View Details <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-blue-50 p-8 rounded-lg mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Don't see the right fit?</h3>
            <p className="text-lg text-gray-700 mb-6">
              We're always looking for talented people to join our team. Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 hover:shadow-lg transition-all">
              Submit Your Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 