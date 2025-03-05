import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

// Test endpoint to get all posts regardless of deleted status
export async function GET() {
  try {
    await dbConnect();
    
    // Get all posts without any filters
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('author', 'name');
    
    console.log(`Found ${posts.length} total posts in database`);
    
    // Log each post for debugging
    posts.forEach((post, index) => {
      console.log(`Post ${index + 1}:`, {
        id: post._id,
        title: post.title,
        slug: post.slug,
        deleted: post.deleted,
        status: post.status,
        author: post.author,
        createdAt: post.createdAt
      });
    });
    
    return NextResponse.json({
      success: true,
      count: posts.length,
      posts: posts.map(post => ({
        id: post._id,
        title: post.title,
        slug: post.slug,
        deleted: post.deleted,
        status: post.status,
        author: post.author && typeof post.author === 'object' && 'name' in post.author ? post.author.name : 'Unknown',
        createdAt: post.createdAt
      }))
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts for testing', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 