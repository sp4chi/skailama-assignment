import mongoose from 'mongoose';

/**
 * Database Connection Configuration
 * Centralized MongoDB connection logic
 */

const connectDB = async () => {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-app';

    const conn = await mongoose.connect(MONGODB_URI, {
      // Mongoose 6+ doesn't need these options, but included for clarity
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
