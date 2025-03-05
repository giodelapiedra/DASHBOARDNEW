import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

interface Params {
  id: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const post = await Post.findById(params.id);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Recover from trash
    post.deleted = false;
    post.deletedAt = undefined;
    await post.save();
    
    return NextResponse.json(
      { message: 'Post recovered successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error recovering post:', error);
    return NextResponse.json(
      { error: 'Failed to recover post' },
      { status: 500 }
    );
  }
} 