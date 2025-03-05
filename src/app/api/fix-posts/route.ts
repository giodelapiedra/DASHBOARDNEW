import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

// Fix posts by setting deleted field to false if not set
export async function GET() {
  try {
    console.log('Starting to fix posts...');
    
    // Connect to database
    await dbConnect();
    console.log('Database connected successfully');
    
    // Find all posts
    const allPosts = await Post.find({});
    console.log(`Found ${allPosts.length} total posts in database`);
    
    // Count posts with deleted field not set
    const postsWithoutDeletedField = allPosts.filter(post => post.deleted === undefined);
    console.log(`Found ${postsWithoutDeletedField.length} posts without deleted field`);
    
    // Update all posts to set deleted=false if not already set
    const updateResult = await Post.updateMany(
      { deleted: { $exists: false } },
      { $set: { deleted: false } }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} posts to set deleted=false`);
    
    // Also update posts where deleted might be null
    const updateNullResult = await Post.updateMany(
      { deleted: null },
      { $set: { deleted: false } }
    );
    
    console.log(`Updated ${updateNullResult.modifiedCount} posts with null deleted field`);
    
    // Get updated counts
    const nonDeletedPosts = await Post.countDocuments({ deleted: false });
    const deletedPosts = await Post.countDocuments({ deleted: true });
    
    return NextResponse.json({
      success: true,
      message: 'Posts fixed successfully',
      totalPosts: allPosts.length,
      postsWithoutDeletedField: postsWithoutDeletedField.length,
      updatedPosts: updateResult.modifiedCount + updateNullResult.modifiedCount,
      nonDeletedPosts,
      deletedPosts
    });
  } catch (error) {
    console.error('Error fixing posts:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix posts', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 