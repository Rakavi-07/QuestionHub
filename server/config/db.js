import mongoose from 'mongoose';

/**
 * Connects to MongoDB Atlas using the connection string in MONGODB_URI.
 * Exits the process on failure so the crash is visible immediately
 * instead of the API silently running without a database.
 */
export default async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not defined in your environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}
