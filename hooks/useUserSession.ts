import { useState, useEffect } from 'react';

const useUserSession = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulated session check
    setTimeout(() => {
      setSession({
        user: {
          id: 'placeholder-user-id',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'agent',
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });
      setLoading(false);
    }, 500);
  }, []);

  return {
    session,
    loading,
    error,
  };
};

export default useUserSession; 