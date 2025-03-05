import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';

interface Params {
  params: {
    slug: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const post = await Post.findOne({ 
      slug: params.slug,
      status: 'published'
    })
      .populate('author', 'name')
      .populate('categories', 'name slug')
      .lean();
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Convert MongoDB document to plain object and handle ObjectId
    const formattedPost = {
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: post.author ? {
        ...post.author,
        _id: post.author._id.toString()
      } : null,
      categories: Array.isArray(post.categories) 
        ? post.categories.map(category => ({
            ...category,
            _id: category._id.toString()
          }))
        : []
    };
    
    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 