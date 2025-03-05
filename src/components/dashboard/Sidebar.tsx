'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiFileText, FiFolder, FiTag, FiSettings, FiUsers, FiTrash2, FiUserPlus } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  highlight?: boolean;
  roles?: string[];
}

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const userRole = session?.user?.role || '';
  const isAdmin = userRole === 'admin';
  
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: <FiHome className="w-5 h-5" />,
      href: '/dashboard',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Posts',
      icon: <FiFileText className="w-5 h-5" />,
      href: '/dashboard/posts',
      roles: ['admin', 'editor', 'author'],
    },
    {
      title: 'Categories',
      icon: <FiFolder className="w-5 h-5" />,
      href: '/dashboard/categories',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Tags',
      icon: <FiTag className="w-5 h-5" />,
      href: '/dashboard/tags',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Trash',
      icon: <FiTrash2 className="w-5 h-5" />,
      href: '/dashboard/trash',
      roles: ['admin', 'editor'],
    },
  ];
  
  // Admin-only menu items
  const adminMenuItems: MenuItem[] = [
    {
      title: 'Users',
      icon: <FiUsers className="w-5 h-5" />,
      href: '/dashboard/users',
      roles: ['admin'],
    },
    {
      title: 'Create New Account',
      icon: <FiUserPlus className="w-5 h-5" />,
      href: '/dashboard/users/register',
      highlight: true,
      roles: ['admin'],
    },
    {
      title: 'Settings',
      icon: <FiSettings className="w-5 h-5" />,
      href: '/dashboard/settings',
      roles: ['admin'],
    },
  ];
  
  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles?.includes(userRole)
  );
  
  // Combine menu items based on user role
  const allMenuItems = isAdmin 
    ? [...filteredMenuItems, ...adminMenuItems] 
    : filteredMenuItems;
  
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {allMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : item.highlight
                    ? 'text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.title}
                {item.highlight && !isActive && (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    New
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar; 