'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Separate component that uses useSearchParams
function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithMagicLink } = useAuth();

  // Clear any errors when the component mounts or email changes
  useEffect(() => {
    setError(null);
  }, [email]);

  // Check for error in URL parameters
  useEffect(() => {
    if (!searchParams) return;
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (errorCode && errorDescription) {
      setError(`Authentication error: ${errorDescription}`);
    }
  }, [searchParams]);

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log("Requesting magic link for:", email);
      const { success, message } = await signInWithMagicLink(email);
      
      if (success) {
        setSuccessMessage(message);
      }
    } catch (err: any) {
      console.error('Magic link error:', err);
      setError(err.message || 'An error occurred while sending the magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">LegacyCore</h1>
          <p className="text-gray-600">Life Insurance Management</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">Sign In with Magic Link</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          
          {!successMessage ? (
            <form onSubmit={handleMagicLinkRequest}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="you@example.com"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="mb-4">Magic link sent! Check your email inbox.</p>
              <p className="text-sm text-gray-500">
                If you don't see the email, check your spam folder.
              </p>
            </div>
          )}
          
          <div className="mt-6 text-center text-sm">
            <p>
              Prefer to use a password?{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in with password
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>Loading magic link form...</p>
        </div>
      </div>
    }>
      <MagicLinkForm />
    </Suspense>
  );
} 