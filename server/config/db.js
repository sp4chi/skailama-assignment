import mongoose from 'mongoose';

/**
 * Database Connection Configuration
 * Optimized for serverless environments (Vercel)
 * Uses cached connection to avoid cold starts
 */

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return existing connection if available
  if (cached.conn) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  // Create new connection if promise doesn't exist
  if (!cached.promise) {
    const MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-app';

    console.log('🔄 Creating new MongoDB connection...');
    
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => {
      console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
      console.log(`📊 Database: ${mongoose.connection.name}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('❌ Error connecting to MongoDB:', error.message);
    throw error;
  }

  return cached.conn;
};

export default connectDB;
