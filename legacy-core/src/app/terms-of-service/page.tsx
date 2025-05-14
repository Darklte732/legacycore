'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Shield } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="container mx-auto max-w-4xl px-6">
        <Link href="/" className="flex items-center mb-8">
          <div className="w-12 h-12 mr-3 flex items-center justify-center bg-yellow-400 rounded-md">
            <span className="text-white font-bold text-lg">LC</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-600">LegacyCore</h1>
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <div className="prose prose-blue max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the LegacyCore platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
            </p>
            
            <h2>2. Description of Service</h2>
            <p>
              LegacyCore provides an insurance management platform designed for insurance agents and managers to track applications, manage commissions, and grow their business. Our platform includes features such as application tracking, commission management, client information management, and analytics.
            </p>
            
            <h2>3. User Accounts</h2>
            <p>
              To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
            <p>
              You are responsible for safeguarding your password and for all activities that occur under your account. You agree to immediately notify LegacyCore of any unauthorized use of your account or any other breach of security.
            </p>
            
            <h2>4. Subscription and Fees</h2>
            <p>
              LegacyCore offers various subscription plans. Payment terms are based on your selected subscription plan and payment method. All fees are non-refundable unless otherwise specified.
            </p>
            <p>
              We reserve the right to change our prices at any time. If we change our prices, we will provide notice of the change on the website or by email, at our discretion.
            </p>
            
            <h2>5. User Content</h2>
            <p>
              Our Service allows you to upload, submit, store, send, and receive content, including but not limited to client information, insurance applications, and related documents ("User Content").
            </p>
            <p>
              You retain all rights in, and are solely responsible for, the User Content you upload, submit, or otherwise make available via the Service. You represent and warrant that you own or have all necessary rights to such User Content and that the use of such User Content does not violate these Terms or applicable law.
            </p>
            
            <h2>6. License to Use the Service</h2>
            <p>
              Subject to these Terms, LegacyCore grants you a limited, non-exclusive, non-transferable, and revocable license to use the Service solely for your internal business purposes.
            </p>
            <p>
              You may not:
            </p>
            <ul>
              <li>License, sublicense, sell, resell, transfer, assign, distribute, or otherwise commercially exploit the Service</li>
              <li>Modify or make derivative works based upon the Service</li>
              <li>Create Internet "links" to the Service or "frame" or "mirror" any part of the Service on any other server or device</li>
              <li>Reverse engineer or access the Service to build a competitive product or service</li>
              <li>Use the Service in any way that violates applicable laws or regulations</li>
            </ul>
            
            <h2>7. Intellectual Property Rights</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of LegacyCore and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used without our prior written permission.
            </p>
            
            <h2>8. Limitation of Liability</h2>
            <p>
              In no event shall LegacyCore, its officers, directors, employees, or agents be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, goodwill, use, data, or other intangible losses, that result from the use of, or inability to use, the Service.
            </p>
            
            <h2>9. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless LegacyCore and its licensees, affiliates, and their respective officers, directors, employees, contractors, agents, licensors, and suppliers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) resulting from your violation of these Terms or your use of the Service.
            </p>
            
            <h2>10. Modifications to the Service</h2>
            <p>
              LegacyCore reserves the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. You agree that LegacyCore shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
            </p>
            
            <h2>11. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
            </p>
            
            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
            </p>
            
            <h2>13. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            
            <h2>14. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> legal@legacycore.com<br />
              <strong>Address:</strong> 123 Insurance Avenue, Suite 500, San Francisco, CA 94105
            </p>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} LegacyCore. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-2">
            <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link href="/support" className="hover:text-blue-600 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 