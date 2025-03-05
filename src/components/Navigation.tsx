'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback, memo } from 'react';

interface NavigationLinkProps {
  href: string;
  isActive: (path: string) => boolean;
  children: React.ReactNode;
  isMobile?: boolean;
}

const NavigationLink = memo(({ href, isActive, children, isMobile = false }: NavigationLinkProps) => {
  const baseClasses = isMobile 
    ? `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
        isActive(href)
          ? 'bg-blue-50 border-blue-500 text-blue-700'
          : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
      }`
    : `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        isActive(href)
          ? 'border-blue-500 text-gray-900'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`;
  
  return (
    <Link href={href} className={baseClasses}>
      {children}
    </Link>
  );
});

NavigationLink.displayName = 'NavigationLink';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const isActive = useCallback((path: string) => {
    return pathname === path;
  }, [pathname]);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Dashboard
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavigationLink href="/" isActive={isActive}>Home</NavigationLink>
              <NavigationLink href="/categories" isActive={isActive}>Categories</NavigationLink>
              <NavigationLink href="/about" isActive={isActive}>About</NavigationLink>
            </div>
          </div>
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Dashboard
            </Link>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed */}
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Icon when menu is open */}
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <NavigationLink href="/" isActive={isActive} isMobile={true}>Home</NavigationLink>
            <NavigationLink href="/categories" isActive={isActive} isMobile={true}>Categories</NavigationLink>
            <NavigationLink href="/about" isActive={isActive} isMobile={true}>About</NavigationLink>
            <Link
              href="/dashboard"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
} 