'use client'

import Link from 'next/link'

export default function TestPage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Test Page</h1>
      <p>This is a test page to check if routing is working.</p>
      
      <div className="mt-4">
        <Link 
          href="/forgot-password" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Go to Forgot Password Page
        </Link>
      </div>
    </div>
  )
} 