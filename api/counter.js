import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 访问计数器的键值
  const counterKey = 'page-views';

  if (req.method === 'GET') {
    // 获取当前计数
    const currentCount = (await kv.get(counterKey)) || 0;
    res.status(200).json({ count: currentCount });
  } else if (req.method === 'POST') {
    // 增加计数
    const currentCount = (await kv.get(counterKey)) || 0;
    await kv.set(counterKey, currentCount + 1);
    res.status(200).json({ count: currentCount + 1 });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
