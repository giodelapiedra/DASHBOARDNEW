'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  author: {
    _id: string;
    name: string;
  };
  categories?: Array<{
    _id: string;
    name: string;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function TrashPage() {
  const router = useRouter();
  const { status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTrashedPosts = async (page = 1, limit = 10) => {
    setIsLoading(true);
    try {
      const url = `/api/posts?page=${page}&limit=${limit}&deleted=true`;
      
      console.log('Fetching trashed posts from URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch trashed posts');
      }
      
      const data = await response.json();
      console.log('Received trashed posts data:', data);
      
      setPosts(data.posts || []);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
      });
    } catch (error) {
      console.error('Error fetching trashed posts:', error);
      setError('Failed to load trashed posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRecover = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/recover`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to recover post');
      }

      // Refresh the posts list
      fetchTrashedPosts(pagination.page, pagination.limit);
      toast.success('Post recovered successfully');
    } catch (error) {
      console.error('Error recovering post:', error);
      toast.error('Failed to recover post');
    }
  };
  
  const handlePermanentDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Refresh the posts list
      fetchTrashedPosts(pagination.page, pagination.limit);
      toast.success('Post permanently deleted');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTrashedPosts(pagination.page, pagination.limit);
    }
  }, [status]);
  
  const handlePageChange = (newPage: number) => {
    fetchTrashedPosts(newPage, pagination.limit);
  };
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trash</h1>
        <div className="flex space-x-4">
          <Link
            href="/dashboard/posts"
            className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Back to Posts
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-10">Loading trashed posts...</div>
      ) : (
        <>
          {posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No items in trash.</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <li key={post._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {post.title}
                          </p>
                          <p className="mt-1 flex items-center text-sm text-gray-500">
                            <span className="truncate">By {post.author?.name || 'Unknown'}</span>
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Deleted on: <span className="font-medium">{new Date(post.deletedAt || '').toLocaleDateString()}</span>
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRecover(post._id)}
                            className="text-green-600 hover:text-green-800"
                            title="Recover"
                          >
                            <FiRefreshCw size={18} />
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(post._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Permanently"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      page === pagination.page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === pagination.totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
} 