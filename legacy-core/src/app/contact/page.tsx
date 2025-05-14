'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send the form data to your server here
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-10">
            <p className="text-lg text-gray-700">
              Have questions about LegacyCore? We're here to help. Reach out to our team using the form below or contact us directly.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Mail className="h-5 w-5 text-blue-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">Email Us</h3>
              </div>
              <p className="text-gray-700 mb-2">General Inquiries:</p>
              <a href="mailto:info@legacycore.com" className="text-blue-600 hover:text-blue-700">info@legacycore.com</a>
              
              <p className="text-gray-700 mb-2 mt-4">Support:</p>
              <a href="mailto:support@legacycore.com" className="text-blue-600 hover:text-blue-700">support@legacycore.com</a>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Phone className="h-5 w-5 text-blue-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">Call Us</h3>
              </div>
              <p className="text-gray-700 mb-2">Main Office:</p>
              <a href="tel:+18005551234" className="text-blue-600 hover:text-blue-700">(800) 555-1234</a>
              
              <p className="text-gray-700 mb-2 mt-4">Technical Support:</p>
              <a href="tel:+18005555678" className="text-blue-600 hover:text-blue-700">(800) 555-5678</a>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-blue-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">Business Hours</h3>
              </div>
              <p className="text-gray-700 mb-2">Monday - Friday:</p>
              <p className="text-gray-900 font-medium">9:00 AM - 6:00 PM EST</p>
              
              <p className="text-gray-700 mb-2 mt-4">Saturday - Sunday:</p>
              <p className="text-gray-900 font-medium">Closed</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Location</h2>
              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 mb-6">
                <div className="flex items-start mb-4">
                  <MapPin className="h-5 w-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Headquarters</h3>
                    <p className="text-gray-700">
                      123 Insurance Plaza<br />
                      Suite 400<br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Placeholder for a map */}
              <div className="bg-gray-200 rounded-lg h-60 w-full flex items-center justify-center">
                <p className="text-gray-500 text-center">Map would appear here</p>
              </div>
            </div>
            
            <div className="md:col-span-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-green-700 mb-2">Thank You!</h3>
                  <p className="text-green-600">Your message has been sent successfully. We'll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2 md:col-span-1">
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name *</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone Number</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject *</label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      ></textarea>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 