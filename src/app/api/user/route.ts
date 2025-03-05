import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// Get current user data
export async function GET() {
  try {
    console.log('GET /api/user - Starting request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('GET /api/user - Unauthorized: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user || !session.user.id) {
      console.log('GET /api/user - Bad request: No user ID in session');
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    console.log('Session user ID:', session.user.id);

    // Connect to database
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');

    // Find user by ID
    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
      console.log('GET /api/user - User not found:', session.user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', user._id);

    // Set cache control headers
    const headers = new Headers();
    headers.set('Cache-Control', 'private, max-age=10');

    return NextResponse.json(user, { headers });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 