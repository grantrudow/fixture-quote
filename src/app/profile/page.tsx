'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSupabase } from '@/context/SupabaseProvider';
import { getUserProfile, updateUserProfile, ensureUserProfile } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';

type ProfileData = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string | null;
};

export default function Profile() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileRecovered, setProfileRecovered] = useState(false);
  const { user } = useSupabase();

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const profile = await getUserProfile(user.id);
        setProfileData(profile);
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setCompany(profile.company || '');
      } catch (err: any) {
        console.error('Error loading profile:', err);
        
        // If profile not found, try to recover it
        if (err.code === 'PGRST116' || err.message?.includes('not found')) {
          try {
            await ensureUserProfile(user.id, user.email || '');
            setProfileRecovered(true);
            // Try to load the profile again
            const profile = await getUserProfile(user.id);
            setProfileData(profile);
            setFirstName(profile.first_name || '');
            setLastName(profile.last_name || '');
            setCompany(profile.company || '');
          } catch (recoverErr: any) {
            setError(`Could not recover profile: ${recoverErr.message}`);
          }
        } else {
          setError(`Error loading profile: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updatedProfile = await updateUserProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        company: company || null,
      });
      
      setProfileData(updatedProfile);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(`Failed to update profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Update your personal information.
                </p>
                {profileRecovered && (
                  <div className="mt-4 p-4 bg-green-50 rounded-md">
                    <p className="text-sm text-green-700">
                      Your profile was recovered successfully.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 bg-white sm:p-6">
                    {error && (
                      <div className="mb-4 p-4 bg-red-50 rounded-md">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                    
                    {success && (
                      <div className="mb-4 p-4 bg-green-50 rounded-md">
                        <p className="text-sm text-green-700">{success}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <input
                          type="text"
                          name="first-name"
                          id="first-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <input
                          type="text"
                          name="last-name"
                          id="last-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>

                      <div className="col-span-6">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <input
                          type="text"
                          name="email"
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-50"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
                      </div>

                      <div className="col-span-6">
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
} 