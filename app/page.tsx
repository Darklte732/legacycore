"use client"

import React, { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  // Simple effect to ensure client-side nav works
  useEffect(() => {
    // Optional: Add any initialization code here
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 flex flex-col items-center justify-center text-white p-4">
      <div className="text-center max-w-3xl">
        <div className="mb-6 flex items-center justify-center">
          <Image 
            src="/images/logo.png" 
            alt="LegacyCore Logo" 
            width={80} 
            height={80} 
            className="rounded-xl shadow-lg"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%234A5568'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='24' fill='white'%3ELC%3C/text%3E%3C/svg%3E"
            }}
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-white">Welcome to LegacyCore</h1>
        <p className="text-xl mb-8 text-blue-200">Your comprehensive insurance management platform</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link href="/login">
            <div className="bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg p-6 shadow-lg text-center">
              <h2 className="text-xl font-semibold mb-2">Agent Portal</h2>
              <p className="text-sm text-blue-200">Manage your clients and policies</p>
            </div>
              </Link>
          
          <Link href="/login">
            <div className="bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg p-6 shadow-lg text-center">
              <h2 className="text-xl font-semibold mb-2">Manager Portal</h2>
              <p className="text-sm text-indigo-200">Oversee your team and analytics</p>
            </div>
              </Link>
          
          <Link href="/login">
            <div className="bg-purple-600 hover:bg-purple-700 transition-colors rounded-lg p-6 shadow-lg text-center">
              <h2 className="text-xl font-semibold mb-2">Admin Portal</h2>
              <p className="text-sm text-purple-200">Complete system administration</p>
            </div>
              </Link>
        </div>

        <div className="space-x-4">
          <Link href="/about-us" className="text-blue-300 hover:text-blue-100 transition-colors">
            About Us
          </Link>
          <Link href="/support" className="text-blue-300 hover:text-blue-100 transition-colors">
            Support
            </Link>
          <Link href="/contact" className="text-blue-300 hover:text-blue-100 transition-colors">
            Contact
            </Link>
        </div>
      </div>
    </div>
  )
}
