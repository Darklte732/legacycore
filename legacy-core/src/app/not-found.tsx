'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-2xl font-semibold text-gray-700 mb-8">Page not found</p>
      <p className="text-lg text-gray-600 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button>
        <Link href="/">
          Return to Home
        </Link>
      </Button>
    </div>
  );
} 