'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/context/SupabaseProvider';

export default function DebugPage() {
  const router = useRouter();
  const { user, isLoading } = useSupabase();
  const [path, setPath] = useState('');
  const [redirectHistory, setRedirectHistory] = useState<string[]>([]);

  useEffect(() => {
    setPath(window.location.pathname);
    
    // Track navigation events
    const handleRouteChange = () => {
      setRedirectHistory(prev => [...prev, window.location.pathname]);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="bg-gray-100 p-4 rounded-md mb-6">
        <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
        <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>User Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
        {user && (
          <div className="mt-2">
            <p><strong>User Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
        )}
      </div>
      
      <div className="bg-gray-100 p-4 rounded-md mb-6">
        <h2 className="text-lg font-semibold mb-2">Navigation Information</h2>
        <p><strong>Current Path:</strong> {path}</p>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Navigation History</h3>
          {redirectHistory.length > 0 ? (
            <ul className="list-disc pl-5">
              {redirectHistory.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          ) : (
            <p>No navigation events recorded yet</p>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test Navigation</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go to Login
          </button>
          <button
            onClick={() => window.location.href = '/signup'}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go to Signup
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
} 