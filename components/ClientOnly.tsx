'use client';

import { useState, useEffect, ReactNode } from 'react';

/**
 * ClientOnly component only renders its children on the client-side,
 * preventing hydration issues caused by server/client mismatches.
 * 
 * Usage:
 * <ClientOnly>
 *   <ComponentWithHydrationIssues />
 * </ClientOnly>
 */
export default function ClientOnly({ 
  children,
  fallback = null
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return fallback;
  }
  
  return <>{children}</>;
} 