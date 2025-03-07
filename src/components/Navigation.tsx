'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabase } from '@/context/SupabaseProvider';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useSupabase();
  const pathname = usePathname();
  const router = useRouter();
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };
  
  // Don't show navigation on login/signup pages
  if (pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/signup/')) {
    return null;
  }
  
  // Determine which navigation links to show based on authentication status
  const navLinks = user ? (
    <>
      <Link
        href="/"
        className={`${
          pathname === '/'
            ? 'border-blue-500 text-gray-900'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
      >
        Home
      </Link>
      <Link
        href="/quotes"
        className={`${
          pathname === '/quotes'
            ? 'border-blue-500 text-gray-900'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
      >
        My Quotes
      </Link>
      <Link
        href="/orders"
        className={`${
          pathname === '/orders'
            ? 'border-blue-500 text-gray-900'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
      >
        My Orders
      </Link>
    </>
  ) : (
    <>
      <Link
        href="/"
        className={`${
          pathname === '/'
            ? 'border-blue-500 text-gray-900'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
      >
        Home
      </Link>
      <Link
        href="/#features"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Features
      </Link>
      <Link
        href="/#how-it-works"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        How It Works
      </Link>
      <Link
        href="/#faq"
        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        FAQ
      </Link>
    </>
  );
  
  // Mobile navigation links
  const mobileNavLinks = user ? (
    <>
      <Link
        href="/"
        className={`${
          pathname === '/'
            ? 'bg-blue-50 border-blue-500 text-blue-700'
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
        } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
      >
        Home
      </Link>
      <Link
        href="/quotes"
        className={`${
          pathname === '/quotes'
            ? 'bg-blue-50 border-blue-500 text-blue-700'
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
        } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
      >
        My Quotes
      </Link>
      <Link
        href="/orders"
        className={`${
          pathname === '/orders'
            ? 'bg-blue-50 border-blue-500 text-blue-700'
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
        } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
      >
        My Orders
      </Link>
    </>
  ) : (
    <>
      <Link
        href="/"
        className={`${
          pathname === '/'
            ? 'bg-blue-50 border-blue-500 text-blue-700'
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
        } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
      >
        Home
      </Link>
      <Link
        href="/#features"
        className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
      >
        Features
      </Link>
      <Link
        href="/#how-it-works"
        className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
      >
        How It Works
      </Link>
      <Link
        href="/#faq"
        className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
      >
        FAQ
      </Link>
    </>
  );
  
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                FixtureQuote
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="ml-3 relative flex items-center">
                <span className="text-sm text-gray-500 mr-4">
                  {user.email}
                </span>
                <Link
                  href="/quotes"
                  className={`${
                    pathname === '/quotes'
                      ? 'bg-gray-100'
                      : 'hover:bg-gray-50'
                  } p-2 rounded-md text-gray-600 mr-2`}
                >
                  My Quotes
                </Link>
                <Link
                  href="/profile"
                  className={`${
                    pathname === '/profile'
                      ? 'bg-gray-100'
                      : 'hover:bg-gray-50'
                  } p-2 rounded-md text-gray-600`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="ml-4 p-2 rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="ml-3 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {mobileNavLinks}
        </div>
        {user ? (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Your Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="space-y-1">
              <Link
                href="/login"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}