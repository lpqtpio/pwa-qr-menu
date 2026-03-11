// api/health.js
import { connectToDatabase } from '../backend/src/config/db.js';
import { getEnvInfo, isVercel } from '../backend/src/config/env.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['GET', 'OPTIONS']
    });
  }

  try {
    // Get environment info first
    const envInfo = getEnvInfo();
    
    // Test database connection
    const startTime = Date.now();
    await connectToDatabase();
    const dbLatency = Date.now() - startTime;

    // Get MongoDB connection status
    const mongoose = (await connectToDatabase()).connection;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        mode: envInfo.nodeEnv,
        isVercel: envInfo.isVercel,
        vercelEnv: envInfo.vercelEnv,
        region: envInfo.vercelRegion || 'local'
      },
      database: {
        connected: mongoose.readyState === 1,
        state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.readyState] || 'unknown',
        latency: `${dbLatency}ms`,
        name: mongoose.name || 'unknown',
        host: mongoose.host || 'unknown'
      },
      api: {
        version: '1.0.0',
        endpoints: [
          '/api/health',
          '/api/menu',
          '/api/menu/:id',
          '/api/categories',
          '/api/categories/:id'
        ]
      }
    };

    // Return 200 if database is connected, otherwise 503
    const statusCode = healthStatus.database.connected ? 200 : 503;
    
    return res.status(statusCode).json(healthStatus);
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: getEnvInfo(),
      error: error.message,
      database: {
        connected: false,
        state: 'disconnected'
      }
    });
  }
}