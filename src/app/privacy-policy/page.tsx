'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <div className="prose prose-blue max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to LegacyCore's Privacy Policy. This Privacy Policy explains how LegacyCore ("we," "us," or "our") collects, uses, discloses, and safeguards your information when you use our insurance management platform.
            </p>
            
            <h2>2. Information We Collect</h2>
            <p>
              We collect several types of information from and about users of our platform, including:
            </p>
            <ul>
              <li>
                <strong>Personal Information:</strong> Name, email address, phone number, postal address, and other identifiers you provide.
              </li>
              <li>
                <strong>Insurance Information:</strong> Policy details, claims history, and related data necessary for managing insurance applications.
              </li>
              <li>
                <strong>User Account Information:</strong> Login credentials, account preferences, and settings.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you use our platform, including page views, clicks, and interactions.
              </li>
              <li>
                <strong>Device Information:</strong> Information about your device, browser, IP address, and operating system.
              </li>
            </ul>
            
            <h2>3. How We Use Your Information</h2>
            <p>
              We use your information for various purposes, including:
            </p>
            <ul>
              <li>Providing and improving our services</li>
              <li>Processing insurance applications and claims</li>
              <li>Communicating with you about your account and our services</li>
              <li>Analyzing usage patterns to enhance user experience</li>
              <li>Ensuring platform security and preventing fraud</li>
              <li>Complying with legal obligations</li>
              <li>Managing commission tracking and payments</li>
            </ul>
            
            <h2>4. Information Sharing and Disclosure</h2>
            <p>
              We may share your information with:
            </p>
            <ul>
              <li>Insurance carriers and partners to process applications</li>
              <li>Service providers who perform services on our behalf</li>
              <li>Legal and regulatory authorities when required by law</li>
              <li>Professional advisors, such as auditors and legal consultants</li>
              <li>Business partners with your consent</li>
            </ul>
            <p>
              We do not sell your personal information to third parties.
            </p>
            
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            
            <h2>6. Your Rights and Choices</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul>
              <li>Accessing your personal information</li>
              <li>Correcting inaccurate information</li>
              <li>Deleting your information (subject to legal requirements)</li>
              <li>Restricting or objecting to processing</li>
              <li>Data portability</li>
              <li>Withdrawing consent</li>
            </ul>
            
            <h2>7. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children.
            </p>
            
            <h2>8. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
            
            <h2>9. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@legacycore.com<br />
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