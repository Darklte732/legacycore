'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronRight, Handshake, Briefcase, BarChart } from 'lucide-react';

export default function PartnersPage() {
  const partnerLogos = [
    { name: "Acme Insurance", size: "large" },
    { name: "Global Health", size: "medium" },
    { name: "Secure Life", size: "large" },
    { name: "Metro Insurance", size: "medium" },
    { name: "Liberty Benefits", size: "large" },
    { name: "Pacific Trust", size: "medium" },
    { name: "American Insurance Group", size: "large" },
    { name: "National Services", size: "medium" }
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Partner With LegacyCore</h1>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-10">
            <p className="text-lg text-gray-700">
              Join our network of insurance carriers, agencies, and technology providers to deliver exceptional solutions to insurance professionals.
            </p>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Partner With Us?</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Handshake className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expand Your Reach</h3>
              <p className="text-gray-700">
                Connect with our growing network of insurance agents and managers to expand your customer base and increase your market presence.
              </p>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enhance Your Offering</h3>
              <p className="text-gray-700">
                Integrate with our platform to provide seamless experiences for mutual customers and enhance your product offering with our technology.
              </p>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Drive Growth</h3>
              <p className="text-gray-700">
                Leverage our platform's capabilities to drive growth for your business through new revenue streams and enhanced customer experiences.
              </p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Partnership Programs</h2>
          
          <div className="space-y-8 mb-12">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Carrier Partners</h3>
                <p className="text-gray-700 mb-4">
                  We partner with insurance carriers to provide seamless integration for policy applications, quotes, and commission tracking. Our carrier partners benefit from increased application volume and improved agent relationships.
                </p>
                <Link href="/partners/carriers" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                  Learn more about carrier partnerships <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Agency Partners</h3>
                <p className="text-gray-700 mb-4">
                  Insurance agencies can join our partner program to receive special pricing, dedicated support, and co-marketing opportunities. Agency partners help shape our product roadmap and gain early access to new features.
                </p>
                <Link href="/partners/agencies" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                  Learn more about agency partnerships <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Technology Partners</h3>
                <p className="text-gray-700 mb-4">
                  Technology providers can integrate with our platform through our API to offer complementary services to our users. Technology partners include CRM systems, document management solutions, and marketing automation platforms.
                </p>
                <Link href="/partners/technology" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                  Learn more about technology partnerships <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Current Partners</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {partnerLogos.map((partner, index) => (
              <div key={index} className={`bg-white shadow-sm rounded-lg border border-gray-200 flex items-center justify-center ${partner.size === 'large' ? 'h-32' : 'h-24'}`}>
                <p className="text-gray-400 font-medium">{partner.name}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-600 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Become a Partner</h2>
            <p className="text-blue-100 mb-6">
              Interested in partnering with LegacyCore? Fill out our partner application form and our partnership team will get in touch with you.
            </p>
            <Link href="/partners/apply" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 hover:shadow-md transition-all inline-block">
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 