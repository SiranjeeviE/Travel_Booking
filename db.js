
import mongoose from 'mongoose';

/**
 * Establishes a connection to MongoDB using the URI provided in environment variables.
 * Includes basic error handling to terminate the process if the connection fails.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

export default connectDB;
