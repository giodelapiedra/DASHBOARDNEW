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
    
    // Move to trash
    post.deleted = true;
    post.deletedAt = new Date();
    await post.save();
    
    return NextResponse.json(
      { message: 'Post moved to trash successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error moving post to trash:', error);
    return NextResponse.json(
      { error: 'Failed to move post to trash' },
      { status: 500 }
    );
  }
} 