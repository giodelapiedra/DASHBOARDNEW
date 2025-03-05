'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiSave, FiX, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import ImageUploader from '@/components/ImageUploader';
import { toast } from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.string().optional(),
  status: z.enum(['draft', 'published']),
});

type PostFormData = z.infer<typeof postSchema>;

export default function NewPostPage() {
  const router = useRouter();
  const { status } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      status: 'draft',
      categories: [],
      featuredImage: '',
    },
  });
  
  // Watch title to generate slug
  const title = watch('title');
  
  // Generate slug from title
  useEffect(() => {
    if (title) {
      // Generate a unique slug by adding a timestamp
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const uniqueSlug = `${baseSlug}-${Date.now()}`;
      setValue('slug', uniqueSlug);
    }
  }, [title, setValue]);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert tags string to array
      const tagsArray = data.tags
        ? data.tags.split(',').map((tag) => tag.trim())
        : [];
      
      const postData = {
        ...data,
        tags: tagsArray,
      };
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || 'Failed to create post');
      } else {
        toast.success('Post created successfully');
        router.push('/dashboard/posts');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle image upload
  const handleImageUpload = (imageUrl: string) => {
    setValue('featuredImage', imageUrl);
  };
  
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
        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        <Link
          href="/dashboard/posts"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiX className="-ml-1 mr-2 h-5 w-5" />
          Cancel
        </Link>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Post Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information about your post.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      errors.title ? 'border-red-300' : ''
                    }`}
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    Slug
                  </label>
                  <input
                    type="text"
                    id="slug"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    {...register('slug')}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The slug is the URL-friendly version of the title. It is automatically generated from the title.
                  </p>
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                    Excerpt
                  </label>
                  <textarea
                    id="excerpt"
                    rows={3}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Brief summary of your post (optional)"
                    {...register('excerpt')}
                  />
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    id="content"
                    rows={10}
                    className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      errors.content ? 'border-red-300' : ''
                    }`}
                    {...register('content')}
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Additional Details</h3>
              <p className="mt-1 text-sm text-gray-500">
                Categorize and add metadata to your post.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <ImageUploader onImageUpload={handleImageUpload} />
                  <input
                    type="hidden"
                    id="featuredImage"
                    {...register('featuredImage')}
                  />
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
                    Categories
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {categories.map((category) => (
                      <div key={category._id} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`category-${category._id}`}
                            type="checkbox"
                            value={category._id}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            {...register('categories')}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor={`category-${category._id}`}
                            className="font-medium text-gray-700"
                          >
                            {category.name}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter tags separated by commas"
                    {...register('tags')}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate tags with commas (e.g., news, technology, featured)
                  </p>
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    {...register('status')}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            onClick={() => router.push('/dashboard/posts')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <FiSave className="-ml-1 mr-2 h-5 w-5" />
            {isLoading ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </form>
    </div>
  );
} 