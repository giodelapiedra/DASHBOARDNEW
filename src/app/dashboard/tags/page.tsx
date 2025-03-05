'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiAlertCircle } from 'react-icons/fi';

export default function TagsPage() {
  const router = useRouter();
  const { status } = useSession();
  
  if (status === 'loading') {
    return <div className="text-center py-10">Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-6 w-6 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-800">Coming Soon</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                The tags feature is currently under development and will be available soon.
                In the meantime, you can manage your posts and categories.
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 