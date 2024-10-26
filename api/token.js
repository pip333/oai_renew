// api/token.js
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const refreshToken = process.env.REFRESH_TOKEN;
  if (!refreshToken) {
    return res.status(500).json({ error: 'Refresh token not configured' });
  }
  
  res.status(200).json({ refreshToken });
}


