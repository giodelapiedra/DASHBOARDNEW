import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Test endpoint to create a sample post
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized or missing user ID' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Create a unique timestamp for the slug
    const timestamp = Date.now();
    
    // Create a test post
    const post = await Post.create({
      title: `Test Post ${timestamp}`,
      content: `This is a test post created at ${new Date().toISOString()}`,
      slug: `test-post-${timestamp}`,
      excerpt: 'This is a test post created for debugging purposes',
      status: 'published',
      deleted: false,
      author: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Test post created successfully:', {
      id: post._id,
      title: post.title,
      slug: post.slug,
      author: post.author
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test post created successfully',
      post: {
        id: post._id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        deleted: post.deleted,
        author: post.author
      }
    });
  } catch (error) {
    console.error('Error creating test post:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create test post', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 