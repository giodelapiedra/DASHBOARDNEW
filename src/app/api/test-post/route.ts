import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Direct database connection without using the app's connection
export async function GET() {
  try {
    console.log('Starting direct database test...');
    
    // Get MongoDB connection string from environment variable
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      console.error('MONGODB_URI environment variable is not set');
      return NextResponse.json({ error: 'Database connection string not found' }, { status: 500 });
    }
    
    console.log('Connecting to MongoDB directly...');
    
    // Connect directly to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    // Get database name from connection string
    const dbName = uri.split('/').pop()?.split('?')[0];
    if (!dbName) {
      console.error('Could not extract database name from connection string');
      return NextResponse.json({ error: 'Invalid database connection string' }, { status: 500 });
    }
    
    const db = client.db(dbName);
    const postsCollection = db.collection('posts');
    
    // Create a test post
    const timestamp = Date.now();
    const testPost = {
      title: `Direct Test Post ${timestamp}`,
      content: `This is a test post created directly via MongoDB at ${new Date().toISOString()}`,
      slug: `direct-test-post-${timestamp}`,
      excerpt: 'This is a test post created for debugging purposes',
      status: 'published',
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Creating test post:', testPost);
    
    // Insert the post
    const result = await postsCollection.insertOne(testPost);
    console.log('Post created with ID:', result.insertedId);
    
    // Get all posts to verify
    const allPosts = await postsCollection.find({}).toArray();
    console.log(`Found ${allPosts.length} total posts in database`);
    
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
    
    return NextResponse.json({
      success: true,
      message: 'Test post created successfully',
      postId: result.insertedId,
      totalPosts: allPosts.length,
      samplePosts: allPosts.slice(0, 5).map(post => ({
        id: post._id,
        title: post.title,
        slug: post.slug,
        deleted: post.deleted,
        status: post.status
      }))
    });
  } catch (error) {
    console.error('Error in direct database test:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create test post', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 