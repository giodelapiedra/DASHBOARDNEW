import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Post from '@/models/Post';
import { formatDate } from '@/lib/utils';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Author {
  _id: string;
  name: string;
}

interface PostData {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  createdAt: string;
  author: Author | null;
}

async function getCategory(slug: string): Promise<CategoryData | null> {
  await connectDB();
  
  const category = await Category.findOne({ slug }).lean();
  
  if (!category) return null;
  
  return {
    _id: String(category._id),
    name: String(category.name || ''),
    slug: String(category.slug || ''),
    description: category.description ? String(category.description) : undefined
  };
}

async function getCategoryPosts(categoryId: string): Promise<PostData[]> {
  await connectDB();
  
  const posts = await Post.find({ 
    categories: categoryId,
    status: 'published'
  })
    .sort({ createdAt: -1 })
    .populate('author', 'name')
    .lean();
  
  return posts.map((post: Record<string, any>) => {
    const author = post.author 
      ? { 
          _id: String(post.author._id || ''),
          name: String(post.author.name || 'Unknown')
        } 
      : null;
    
    return {
      _id: String(post._id),
      title: String(post.title || ''),
      slug: String(post.slug || ''),
      excerpt: post.excerpt ? String(post.excerpt) : undefined,
      featuredImage: post.featuredImage ? String(post.featuredImage) : undefined,
      createdAt: formatDate(post.createdAt),
      author
    };
  });
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await getCategory(params.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found'
    };
  }
  
  return {
    title: `${category.name} - News Dashboard`,
    description: category.description || `Browse articles in the ${category.name} category`
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategory(params.slug);
  
  if (!category) {
    notFound();
  }
  
  const posts = await getCategoryPosts(category._id);
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-xl text-gray-600">{category.description}</p>
        )}
      </header>
      
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
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
                      <span className="mx-1">•</span>
                      <span>By {post.author.name}</span>
                    </>
                  )}
                </div>
                
                {post.excerpt && (
                  <p className="text-gray-700 mb-4">{post.excerpt}</p>
                )}
                
                <Link
                  href={`/posts/${post.slug}`}
                  className="inline-block text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No posts available in this category yet.</p>
          <Link
            href="/categories"
            className="inline-block text-blue-600 hover:text-blue-800 font-medium"
          >
            Browse all categories
          </Link>
        </div>
      )}
    </div>
  );
} 