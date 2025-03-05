import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import { formatDate } from '@/lib/utils';
import { loadModels } from '@/lib/loadModels';
import mongoose from 'mongoose';

interface PostData {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: { _id: string; name: string } | null;
  categories: Array<{ _id: string; name: string; slug: string }>;
}

// Define a more flexible type for database objects
type DbPost = {
  _id: mongoose.Types.ObjectId | string;
  title?: string;
  slug?: string;
  excerpt?: string;
  featuredImage?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
  author?: { _id: mongoose.Types.ObjectId | string; name?: string } | null;
  categories?: Array<{ _id: mongoose.Types.ObjectId | string; name?: string; slug?: string }>;
};

async function getPosts(): Promise<PostData[]> {
  try {
    console.log('Connecting to database from homepage...');
    await dbConnect();
    console.log('Database connected successfully');
    
    // Ensure all models are loaded before using them
    await loadModels();
    
    console.log('Fetching published posts...');
    // Use type assertion for the mongoose query result
    const posts = await Post.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'name')
      .populate('categories', 'name slug')
      .lean();
    
    console.log(`Found ${posts.length} published posts`);
    
    // Transform the posts to ensure proper types
    return (posts as unknown as DbPost[]).map((post) => {
      // Handle author data
      let author = null;
      if (post.author && typeof post.author === 'object') {
        author = {
          _id: String(post.author._id || ''),
          name: String(post.author.name || 'Unknown')
        };
      }
      
      // Handle categories data
      const categories = Array.isArray(post.categories)
        ? post.categories.map((category) => ({
            _id: String(category._id || ''),
            name: String(category.name || 'Uncategorized'),
            slug: String(category.slug || 'uncategorized')
          }))
        : [];
      
      // Return the transformed post
      return {
        _id: String(post._id),
        title: String(post.title || ''),
        slug: String(post.slug || ''),
        excerpt: post.excerpt ? String(post.excerpt) : undefined,
        featuredImage: post.featuredImage ? String(post.featuredImage) : undefined,
        status: String(post.status || 'draft'),
        createdAt: formatDate(post.createdAt),
        updatedAt: formatDate(post.updatedAt),
        author,
        categories
      };
    });
  } catch (error) {
    console.error('Error fetching posts for homepage:', error);
    return []; // Return empty array on error
  }
}

export default async function HomePage() {
  const posts = await getPosts();
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">News Dashboard</h1>
        <p className="text-xl text-gray-600">
          Latest news and updates
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length > 0 ? (
          posts.map(post => (
            <article key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {post.featuredImage && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h2>
                
                <div className="text-sm text-gray-600 mb-4">
                  <span>{post.createdAt}</span>
                  {post.author && (
                    <>
                      <span className="mx-2">•</span>
                      <span>By {post.author.name}</span>
                    </>
                  )}
                </div>
                
                {post.excerpt && (
                  <p className="text-gray-700 mb-4">{post.excerpt}</p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {post.categories.map(category => (
                    <span 
                      key={category._id}
                      className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-xl text-gray-600">No published posts found.</p>
            <p className="mt-2 text-gray-500">Check back later for updates.</p>
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center">
        <Link
          href="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
