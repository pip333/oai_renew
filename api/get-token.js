// /api/get-token.js

export default function handler(req, res) {
    // 从 Vercel 环境变量中获取 token
    const token = process.env.OAI_REFRESH_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'Token not found' });
    }
    res.status(200).json({ token });
}
