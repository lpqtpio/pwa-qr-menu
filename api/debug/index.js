// api/debug/index.js
export default function handler(req, res) {
  res.status(200).json({
    message: "Debug endpoint in subfolder works!",
    timestamp: new Date().toISOString()
  });
}