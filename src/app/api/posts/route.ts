import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import mongoose from 'mongoose';

interface PostQuery {
  deleted?: boolean;
  status?: string;
  $or?: Array<{
    title?: { $regex: string, $options: string };
    content?: { $regex: string, $options: string };
  }>;
}

// Rate limiting variables
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;
const requestCounts = new Map<string, { count: number, resetTime: number }>();

// Helper function to implement basic rate limiting
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requestData = requestCounts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  // Reset count if window has passed
  if (now > requestData.resetTime) {
    requestData.count = 1;
    requestData.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    requestData.count += 1;
  }
  
  requestCounts.set(ip, requestData);
  return requestData.count <= MAX_REQUESTS_PER_WINDOW;
}

// Get all posts
export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/posts - Starting request');
    
    // Basic rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('GET /api/posts - Unauthorized: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Session user ID:', session.user.id);
    
    // Connect to database
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    // Get query parameters
    const url = new URL(req.url);
    
    // Validate and sanitize input parameters
    const pageParam = url.searchParams.get('page') || '1';
    const limitParam = url.searchParams.get('limit') || '10';
    const status = url.searchParams.get('status') || '';
    const search = url.searchParams.get('search') || '';
    const deletedParam = url.searchParams.get('deleted');
    
    // Validate numeric parameters
    if (!/^\d+$/.test(pageParam) || !/^\d+$/.test(limitParam)) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }
    
    const page = parseInt(pageParam);
    const limit = Math.min(parseInt(limitParam), 50); // Cap limit to prevent excessive queries
    
    // Validate status parameter
    if (status && !['draft', 'published'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status parameter' }, { status: 400 });
    }
    
    console.log('Query parameters:', {
      page,
      limit,
      status,
      search,
      deletedParam,
      url: req.url
    });
    
    // Build query
    const query: PostQuery = {};
    
    // Set deleted filter - only set it explicitly based on the query parameter
    if (deletedParam === 'true') {
      query.deleted = true;
      console.log('Fetching deleted posts');
    } else if (deletedParam === 'false') {
      query.deleted = false;
      console.log('Fetching non-deleted posts');
    } else {
      // If no deleted parameter is provided, default to showing non-deleted posts
      query.deleted = false;
      console.log('No deleted parameter provided, defaulting to non-deleted posts');
    }
    
    if (status) {
      query.status = status;
      console.log('Filtering by status:', status);
    }
    
    if (search) {
      // Sanitize search input to prevent regex injection
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { content: { $regex: sanitizedSearch, $options: 'i' } },
      ];
      console.log('Searching for:', sanitizedSearch);
    }
    
    console.log('Final query:', JSON.stringify(query)); // Debug log
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Post.countDocuments(query);
    console.log('Total matching posts:', total);
    
    // IMPORTANT: Check if the Post model is properly defined
    console.log('Post model schema:', Post.schema.paths);
    
    // Get posts with minimal query first to check if any posts exist
    const allPosts = await Post.find({}).limit(5);
    console.log(`Found ${allPosts.length} total posts in database (sample)`);
    
    if (allPosts.length > 0) {
      console.log('Sample post from database:', {
        id: allPosts[0]._id,
        title: allPosts[0].title,
        deleted: allPosts[0].deleted,
        status: allPosts[0].status,
        author: allPosts[0].author
      });
    } else {
      console.log('No posts found in the database at all');
    }
    
    // Get posts with the actual query
    console.log('Executing query to find posts...');
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('categories', 'name slug')
      .populate('author', 'name');
    
    console.log('Found posts:', posts.length); // Debug log
    
    // Log the first post for debugging
    if (posts.length > 0) {
      console.log('First post:', {
        id: posts[0]._id,
        title: posts[0].title,
        deleted: posts[0].deleted,
        status: posts[0].status,
        author: posts[0].author
      });
    } else {
      console.log('No posts found matching the query');
    }
    
    // Set cache control headers
    const headers = new Headers();
    headers.set('Cache-Control', 'private, max-age=10');
    
    return NextResponse.json({
      posts,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }, { headers });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Create a new post
export async function POST(req: NextRequest) {
  try {
    // Basic rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!session.user || !session.user.id) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }
    
    await dbConnect();
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: 'Title and content are required' 
      }, { status: 400 });
    }
    
    // Validate title length
    if (body.title.length < 3 || body.title.length > 200) {
      return NextResponse.json({ 
        error: 'Invalid title length', 
        details: 'Title must be between 3 and 200 characters' 
      }, { status: 400 });
    }
    
    // Ensure slug is unique by adding timestamp if not already present
    if (body.slug && !body.slug.includes('-' + Date.now().toString().substring(0, 8))) {
      body.slug = `${body.slug}-${Date.now()}`;
    }
    
    console.log('Creating post with author ID:', session.user.id);
    console.log('Post data:', JSON.stringify(body));
    
    // Create post with explicit defaults
    const post = await Post.create({
      ...body,
      author: session.user.id,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Post created successfully:', post._id);
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    
    let errorMessage = 'Failed to create post';
    const errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = `Failed to create post: ${error.message}`;
      
      // Check for MongoDB duplicate key error
      if (error.message.includes('E11000 duplicate key error')) {
        errorMessage = 'A post with this slug already exists. Please use a different slug.';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
} 