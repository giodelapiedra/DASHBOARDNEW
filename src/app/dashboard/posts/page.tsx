'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiEdit2, FiTrash2, FiRefreshCw, FiEye } from 'react-icons/fi';
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

export default function PostsPage() {
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
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  
  const fetchPosts = async (page = 1, limit = 10, status = '') => {
    setIsLoading(true);
    setError(null);
    try {
      // Add request timeout for better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      let url = `/api/posts?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${encodeURIComponent(status)}`;
      }
      if (showTrash) {
        url += '&deleted=true';
      } else {
        // Explicitly request non-deleted posts
        url += '&deleted=false';
      }
      
      console.log('Fetching posts from URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch posts. Status:', response.status, 'Response:', errorText);
        throw new Error(`Failed to fetch posts: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received posts data:', JSON.stringify(data));
      
      // Check if posts array exists and has items
      if (!data.posts || !Array.isArray(data.posts)) {
        console.error('Invalid posts data received:', data);
        setError('Received invalid posts data from server');
        setPosts([]);
      } else {
        console.log(`Found ${data.posts.length} posts`);
        if (data.posts.length > 0) {
          console.log('First post:', data.posts[0]);
        }
        
        // Ensure we have valid post objects
        const validPosts = data.posts.filter((post: Partial<Post>) => post && post._id);
        console.log(`${validPosts.length} valid posts after filtering`);
        
        setPosts(validPosts as Post[]);
      }
      
      setPagination({
        page: data.page || 1,
        limit: data.limit || 10,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to load posts. Please try again.');
      }
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSoftDelete = async (postId: string) => {
    // Validate postId format
    if (!postId || !/^[0-9a-fA-F]{24}$/.test(postId)) {
      toast.error('Invalid post ID');
      return;
    }

    if (!confirm('Are you sure you want to move this post to trash?')) {
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`/api/posts/${postId}/trash`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to trash post');
      }

      // Refresh the posts list
      fetchPosts(pagination.page, pagination.limit, statusFilter);
      toast.success('Post moved to trash');
    } catch (error) {
      console.error('Error trashing post:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error('Failed to move post to trash');
      }
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
      fetchPosts(pagination.page, pagination.limit, statusFilter);
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
      fetchPosts(pagination.page, pagination.limit, statusFilter);
      toast.success('Post permanently deleted');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };
  
  useEffect(() => {
    if (status === 'authenticated') {
      console.log('Authenticated, fetching posts with showTrash:', showTrash);
      console.log('Current pagination:', pagination);
      console.log('Current statusFilter:', statusFilter);
      fetchPosts(pagination.page, pagination.limit, statusFilter);
    }
  }, [status, statusFilter, showTrash]);
  
  const handlePageChange = (newPage: number) => {
    fetchPosts(newPage, pagination.limit, statusFilter);
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
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
        <h1 className="text-2xl font-bold">{showTrash ? 'Trash' : 'Posts'}</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
          >
            {showTrash ? 'View Posts' : 'View Trash'}
          </button>
          {!showTrash && (
            <Link
              href="/dashboard/posts/new"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create New Post
            </Link>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
          Filter by Status
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
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
        <div className="text-center py-10">Loading posts...</div>
      ) : (
        <>
          {posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No posts found.</p>
              {!showTrash && (
                <Link
                  href="/dashboard/posts/new"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create your first post
                </Link>
              )}
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
                            Status: <span className={`font-medium ${post.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}>{post.status}</span>
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {showTrash ? (
                            <>
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
                            </>
                          ) : (
                            <>
                              <Link
                                href={`/dashboard/posts/edit/${post._id}`}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <FiEdit2 size={18} />
                              </Link>
                              <button
                                onClick={() => handleSoftDelete(post._id)}
                                className="text-red-600 hover:text-red-800"
                                title="Move to Trash"
                              >
                                <FiTrash2 size={18} />
                              </button>
                              {post.status === 'published' && (
                                <Link
                                  href={`/posts/${post.slug}`}
                                  target="_blank"
                                  className="text-green-600 hover:text-green-800"
                                  title="View"
                                >
                                  <FiEye size={18} />
                                </Link>
                              )}
                            </>
                          )}
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