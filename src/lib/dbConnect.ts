import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isConnected: boolean;
}

// @ts-expect-error - global mongoose
let cached: Cached = global.mongoose;

if (!cached) {
  // @ts-expect-error - global mongoose
  cached = global.mongoose = { conn: null, promise: null, isConnected: false };
}

async function dbConnect() {
  if (cached.isConnected) {
    return cached.conn;
  }

  if (cached.conn) {
    cached.isConnected = true;
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    console.log('Connecting to MongoDB Atlas...');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('MongoDB Atlas connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    cached.isConnected = true;
    
    // Import models here to ensure they are registered
    // This prevents "MissingSchemaError" when models reference each other
    await Promise.all([
      import('@/models/User'),
      import('@/models/Post'),
      import('@/models/Category')
    ]);
    
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.isConnected = false;
    console.error('MongoDB Atlas connection error:', error);
    throw error;
  }
}

export default dbConnect; 