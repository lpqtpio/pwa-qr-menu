export default function handler(req, res) {
  console.log('Health check called');
  console.log('Node version:', process.version);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  
  res.status(200).json({
    status: 'healthy',
    message: 'Basic API working',
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      env: process.env.NODE_ENV,
      hasDbString: !!process.env.MONGODB_URI
    }
  });
}