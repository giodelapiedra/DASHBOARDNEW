import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('Unauthorized access attempt to fix-all-posts');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Log request information
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    console.log(`Starting to fix all posts... Request from IP: ${ip}`);
    console.log('Request initiated by user:', session.user.id);
    
    // Connect to database
    await dbConnect();
    console.log('Database connected successfully');
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    // Find all posts without any filters
    const allPosts = await Post.find({});
    console.log(`Found ${allPosts.length} total posts in database`);
    
    // Fix deleted field for all posts
    const updateDeletedResult = await Post.updateMany(
      { deleted: { $exists: false } },
      { $set: { deleted: false } }
    );
    
    console.log(`Updated ${updateDeletedResult.modifiedCount} posts to set deleted=false`);
    
    // Fix null deleted field
    const updateNullDeletedResult = await Post.updateMany(
      { deleted: null },
      { $set: { deleted: false } }
    );
    
    console.log(`Updated ${updateNullDeletedResult.modifiedCount} posts with null deleted field`);
    
    // Fix status field if missing
    const updateStatusResult = await Post.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'draft' } }
    );
    
    console.log(`Updated ${updateStatusResult.modifiedCount} posts to set status=draft`);
    
    // Fix null status field
    const updateNullStatusResult = await Post.updateMany(
      { status: null },
      { $set: { status: 'draft' } }
    );
    
    console.log(`Updated ${updateNullStatusResult.modifiedCount} posts with null status field`);
    
    // Get updated counts
    const nonDeletedPosts = await Post.countDocuments({ deleted: false });
    const deletedPosts = await Post.countDocuments({ deleted: true });
    const draftPosts = await Post.countDocuments({ status: 'draft' });
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    
    // Set cache control headers to prevent caching
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    return NextResponse.json({
      success: true,
      message: 'All posts fixed successfully',
      totalPosts: allPosts.length,
      updatedDeletedField: updateDeletedResult.modifiedCount + updateNullDeletedResult.modifiedCount,
      updatedStatusField: updateStatusResult.modifiedCount + updateNullStatusResult.modifiedCount,
      counts: {
        nonDeleted: nonDeletedPosts,
        deleted: deletedPosts,
        draft: draftPosts,
        published: publishedPosts
      }
    }, { headers });
  } catch (error) {
    console.error('Error fixing all posts:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix all posts', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 