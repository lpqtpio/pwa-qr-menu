export default function handler(req, res) {
  res.status(200).json({ 
    message: "API is working!",
    env: process.env.NODE_ENV,
    hasDbString: !!process.env.MONGODB_URI,
    timestamp: new Date().toISOString()
  });
}