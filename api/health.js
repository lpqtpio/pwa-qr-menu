import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const backendPath = join(__dirname, '../backend/src/config/db.js');

const { connectToDatabase } = await import(backendPath);

export default async function handler(req, res) {
  console.log('Health check called');
  console.log('Node version:', process.version);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  
  try {
    // Actually use the database connection
    const mongoose = await connectToDatabase();
    
    res.status(200).json({
      status: 'healthy',
      message: 'Database connected successfully',
      timestamp: new Date().toISOString(),
      database: {
        connected: mongoose.connection.readyState === 1,
        name: mongoose.connection.name
      },
      environment: {
        node: process.version,
        env: process.env.NODE_ENV,
        hasDbString: !!process.env.MONGODB_URI
      }
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    
    res.status(500).json({
      status: 'unhealthy',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: {
        node: process.version,
        env: process.env.NODE_ENV,
        hasDbString: !!process.env.MONGODB_URI
      }
    });
  }
}