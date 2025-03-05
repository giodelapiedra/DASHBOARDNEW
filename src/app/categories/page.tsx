import Link from 'next/link';
import connectDB from '@/lib/db';
import Category from '@/models/Category';

export const metadata = {
  title: 'Categories - News Dashboard',
  description: 'Browse news by category',
};

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

async function getCategories(): Promise<CategoryData[]> {
  await connectDB();
  
  const categories = await Category.find()
    .sort({ name: 1 })
    .lean();
  
  // Define a type for the MongoDB document with _id as ObjectId
  interface CategoryDocument {
    _id: { toString(): string };
    name: string;
    slug: string;
    description?: string;
  }
  
  return categories.map((category: CategoryDocument) => ({
    _id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description || '',
  }));
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Categories</h1>
      
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div 
              key={category._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  <Link 
                    href={`/categories/${category.slug}`}
                    className="hover:text-blue-600"
                  >
                    {category.name}
                  </Link>
                </h2>
                
                {category.description && (
                  <p className="text-gray-600 mb-4">{category.description}</p>
                )}
                
                <Link
                  href={`/categories/${category.slug}`}
                  className="inline-block text-blue-600 hover:text-blue-800 font-medium"
                >
                  View articles →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No categories available yet.</p>
          <Link
            href="/"
            className="inline-block text-blue-600 hover:text-blue-800 font-medium"
          >
            Return to home
          </Link>
        </div>
      )}
    </div>
  );
} 