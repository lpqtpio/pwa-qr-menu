// api/test/index.js
export default function handler(req, res) {
  // Set headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Return JSON response
  res.status(200).json({
    message: 'Test endpoint is working!',
    timestamp: new Date().toISOString(),
    note: 'This is from api/test/index.js'
  });
}