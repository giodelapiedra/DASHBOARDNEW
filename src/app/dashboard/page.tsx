import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { FiFileText, FiFolder, FiTag, FiUsers } from 'react-icons/fi';
import connectDB from '@/lib/db';
import Post, { IPost } from '@/models/Post';
import Category from '@/models/Category';
import User from '@/models/User';
import Link from 'next/link';
import { Types } from 'mongoose';

// Define a type for populated post
interface PopulatedPost extends Omit<IPost, 'author' | 'categories'> {
  _id: Types.ObjectId;
  author: {
    _id: Types.ObjectId;
    name: string;
  } | Types.ObjectId;
  categories: Array<{
    _id: Types.ObjectId;
    name: string;
  } | Types.ObjectId>;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return null;
  }
  
  await connectDB();
  
  // Get counts
  const postsCount = await Post.countDocuments();
  const categoriesCount = await Category.countDocuments();
  const usersCount = await User.countDocuments();
  
  // Get recent posts
  const recentPosts = await Post.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('author', 'name')
    .populate('categories', 'name') as unknown as PopulatedPost[];
  
  const stats = [
    {
      title: 'Total Posts',
      value: postsCount,
      icon: <FiFileText className="w-8 h-8 text-blue-500" />,
      href: '/dashboard/posts',
      color: 'bg-blue-50',
    },
    {
      title: 'Categories',
      value: categoriesCount,
      icon: <FiFolder className="w-8 h-8 text-green-500" />,
      href: '/dashboard/categories',
      color: 'bg-green-50',
    },
    {
      title: 'Tags',
      value: 0, // We'll implement tags later
      icon: <FiTag className="w-8 h-8 text-yellow-500" />,
      href: '#', // Temporarily disabled until tags feature is implemented
      color: 'bg-yellow-50',
    },
  ];
  
  // Add users stat for admins
  if (session.user.role === 'admin') {
    stats.push({
      title: 'Users',
      value: usersCount,
      icon: <FiUsers className="w-8 h-8 text-purple-500" />,
      href: '/dashboard/users',
      color: 'bg-purple-50',
    });
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {session.user.name || session.user.email}!
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className={`${stat.color} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">{stat.icon}</div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Recent Posts */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Posts</h2>
          <Link
            href="/dashboard/posts"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>
        
        <div className="overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <li key={post._id.toString()} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {post.title}
                      </p>
                      <div className="flex items-center mt-1">
                        <p className="text-xs text-gray-500">
                          By {typeof post.author === 'object' && post.author && 'name' in post.author ? post.author.name : 'Unknown'}
                        </p>
                        <span className="mx-1 text-gray-500">•</span>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        <span className="mx-1 text-gray-500">•</span>
                        <p className="text-xs text-gray-500 capitalize">
                          Status: {post.status}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/posts/edit/${post._id.toString()}`}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))
            ) : (
              <li className="py-4 text-center text-gray-500">No posts yet</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
} 