'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/context/SupabaseProvider';
import { diagnoseProfilesTable } from '@/lib/auth';
import { checkDatabaseConnection } from '@/lib/supabase';

export default function DiagnosePage() {
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [profilesStatus, setProfilesStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    async function runDiagnostics() {
      setLoading(true);
      setError(null);
      
      try {
        // Check database connection
        const connectionStatus = await checkDatabaseConnection();
        setDbStatus(connectionStatus);
        
        if (!connectionStatus.connected) {
          setError('Database connection failed. Please check your Supabase configuration.');
          setLoading(false);
          return;
        }
        
        // Diagnose profiles table
        const profilesDiagnosis = await diagnoseProfilesTable();
        setProfilesStatus(profilesDiagnosis);
      } catch (err) {
        setError(`Diagnostic error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
    
    runDiagnostics();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Database Diagnostics</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Database Connection</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full mr-2 ${dbStatus?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-sm font-medium text-gray-900">
                  {dbStatus?.connected ? 'Connected' : 'Not Connected'}
                </p>
              </div>
              {dbStatus?.error && (
                <p className="mt-2 text-sm text-red-600">{dbStatus.error}</p>
              )}
            </div>
          </div>
          
          {profilesStatus && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Profiles Table</h2>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Table Exists</dt>
                    <dd className="mt-1 flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${profilesStatus.tableExists ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-900">{profilesStatus.tableExists ? 'Yes' : 'No'}</span>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Can Query</dt>
                    <dd className="mt-1 flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${profilesStatus.canQuery ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-900">{profilesStatus.canQuery ? 'Yes' : 'No'}</span>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Required Columns</dt>
                    <dd className="mt-1 flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${profilesStatus.requiredColumns ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-900">{profilesStatus.requiredColumns ? 'Yes' : 'No'}</span>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Can Insert</dt>
                    <dd className="mt-1 flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${profilesStatus.canInsert ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-900">{profilesStatus.canInsert ? 'Yes' : 'No'}</span>
                    </dd>
                  </div>
                </dl>
                
                {profilesStatus.errors.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900">Errors</h3>
                    <ul className="mt-2 text-sm text-red-600 list-disc pl-5 space-y-1">
                      {profilesStatus.errors.map((err: string, index: number) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Actions</h3>
            
            {!dbStatus?.connected && (
              <div className="bg-yellow-50 p-4 rounded-md mb-4">
                <p className="text-sm text-yellow-700">
                  <strong>Database Connection Issue:</strong> Check your Supabase URL and API key in the environment variables.
                </p>
              </div>
            )}
            
            {profilesStatus && !profilesStatus.tableExists && (
              <div className="bg-yellow-50 p-4 rounded-md mb-4">
                <p className="text-sm text-yellow-700">
                  <strong>Missing Profiles Table:</strong> You need to create the profiles table in your Supabase database.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  Run the following SQL in the Supabase SQL Editor:
                </p>
                <pre className="mt-2 bg-gray-800 text-white p-3 rounded text-xs overflow-x-auto">
{`CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, '', '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`}
                </pre>
              </div>
            )}
            
            {profilesStatus && profilesStatus.tableExists && !profilesStatus.requiredColumns && (
              <div className="bg-yellow-50 p-4 rounded-md mb-4">
                <p className="text-sm text-yellow-700">
                  <strong>Missing Required Columns:</strong> The profiles table is missing one or more required columns.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  Make sure your profiles table has these columns: id, email, first_name, last_name, company
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 