'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { FiMenu, FiBell, FiUser, FiLogOut, FiHome, FiFileText, FiFolder, FiTag, FiTrash2, FiUsers, FiUserPlus, FiSettings } from 'react-icons/fi';

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id: string;
    role: string;
  };
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  roles: string[];
}

const Header = ({ user }: HeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = user.role || '';
  const isAdmin = userRole === 'admin';
  
  // Define menu items with role-based access
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: <FiHome className="mr-3 h-5 w-5" />,
      href: '/dashboard',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Posts',
      icon: <FiFileText className="mr-3 h-5 w-5" />,
      href: '/dashboard/posts',
      roles: ['admin', 'editor', 'author'],
    },
    {
      title: 'Categories',
      icon: <FiFolder className="mr-3 h-5 w-5" />,
      href: '/dashboard/categories',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Tags',
      icon: <FiTag className="mr-3 h-5 w-5" />,
      href: '/dashboard/tags',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Trash',
      icon: <FiTrash2 className="mr-3 h-5 w-5" />,
      href: '/dashboard/trash',
      roles: ['admin', 'editor'],
    },
  ];
  
  // Admin-only menu items
  const adminMenuItems: MenuItem[] = [
    {
      title: 'Users',
      icon: <FiUsers className="mr-3 h-5 w-5" />,
      href: '/dashboard/users',
      roles: ['admin'],
    },
    {
      title: 'Create New Account',
      icon: <FiUserPlus className="mr-3 h-5 w-5" />,
      href: '/dashboard/users/register',
      roles: ['admin'],
    },
    {
      title: 'Settings',
      icon: <FiSettings className="mr-3 h-5 w-5" />,
      href: '/dashboard/settings',
      roles: ['admin'],
    },
  ];
  
  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );
  
  // Get admin menu items if user is admin
  const visibleAdminItems = isAdmin ? adminMenuItems : [];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <FiMenu className="block h-6 w-6" />
            </button>
            
            <div className="md:hidden ml-2 font-semibold text-gray-800">
              Dashboard
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center">
            <button
              type="button"
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">View notifications</span>
              <FiBell className="h-6 w-6" />
            </button>
            
            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  {user.image ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.image}
                      alt={user.name || 'User'}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <FiUser />
                    </div>
                  )}
                  <span className="ml-2 text-gray-700 hidden md:block">
                    {user.name || user.email}
                  </span>
                </button>
              </div>
              
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">Role: {user.role}</p>
                  </div>
                  
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="flex items-center">
                      <FiUser className="mr-2" />
                      Your Profile
                    </div>
                  </Link>
                  
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FiLogOut className="mr-2" />
                      Sign out
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {/* Regular menu items */}
            {filteredMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
            
            {/* Admin-only menu items */}
            {visibleAdminItems.length > 0 && (
              <>
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </p>
                </div>
                
                {visibleAdminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium ${
                      item.title === 'Create New Account' 
                        ? 'text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    {item.title}
                    {item.title === 'Create New Account' && (
                      <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        New
                      </span>
                    )}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 