'use client';

import { InfiniteSlider } from "./infinite-slider";
import { Shield, Lock, Check, Server } from 'lucide-react';
import Image from 'next/image';

export function CarrierLogoSlider() {
  return (
    <div className="py-8 bg-gray-50 border-y border-gray-200">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">ADVANCED COMMISSION TRACKING</p>
        </div>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-5">Currently Supporting</h3>
          
          <InfiniteSlider 
            durationOnHover={75} 
            gap={80}
            className="py-4 mb-4"
          >
            {/* Americo Logo */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all transform hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" className="h-16 w-auto">
                <rect fill="#ffffff" width="300" height="100"/>
                <text fill="#002864" fontFamily="Arial" fontSize="24" fontWeight="bold" x="85" y="55">Americo</text>
              </svg>
            </div>
            
            {/* AIG Logo */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all transform hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" className="h-16 w-auto">
                <rect fill="#002864" width="300" height="100"/>
                <text fill="#ffffff" fontFamily="Arial" fontSize="24" fontWeight="bold" x="130" y="55">AIG</text>
              </svg>
            </div>
            
            {/* Aetna Logo */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all transform hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" className="h-16 w-auto">
                <rect fill="#ffffff" width="300" height="100"/>
                <text fill="#601986" fontFamily="Arial" fontSize="24" fontWeight="bold" x="110" y="55">Aetna</text>
              </svg>
            </div>
            
            {/* Gerber Logo */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all transform hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" className="h-16 w-auto">
                <rect fill="#ffffff" width="300" height="100"/>
                <text fill="#002864" fontFamily="Arial" fontSize="24" fontWeight="bold" x="110" y="55">Gerber</text>
              </svg>
            </div>
          </InfiniteSlider>
          
          <p className="text-gray-600 mt-6">Automatic tracking of policy status, chargebacks, and payment issues</p>
          <p className="text-blue-600 font-medium mt-2 mb-4 animate-pulse">More carriers coming soon!</p>
        </div>
        
        <div className="flex justify-center mt-10 gap-6">
          <div className="flex items-center bg-white px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-500">
            <Shield className="h-4 w-4 mr-2 text-green-500" />
            <span>SOC 2 Compliant</span>
          </div>
          <div className="flex items-center bg-white px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-500">
            <Lock className="h-4 w-4 mr-2 text-green-500" />
            <span>GDPR Compliant</span>
          </div>
          <div className="flex items-center bg-white px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-500">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex items-center bg-white px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-500">
            <Server className="h-4 w-4 mr-2 text-green-500" />
            <span>99.9% Uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
} 