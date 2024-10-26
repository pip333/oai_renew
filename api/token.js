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

// index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OAIFree Auto Login</title>
</head>
<body>
    <h1>OAIFree 自动登录</h1>
    <div id="status">登录状态：未登录</div>

    <script>
        const TOKEN_URL = 'https://token.oaifree.com/api/auth/refresh';
        const SHARE_TOKEN_URL = 'https://chat.oaifree.com/token/register';
        const LOGIN_URL = 'https://new.oaifree.com/auth/login_share';

        async function getRefreshToken() {
            const response = await fetch('/api/token');
            if (!response.ok) {
                throw new Error('Failed to get refresh token');
            }
            const data = await response.json();
            return data.refreshToken;
        }

        async function getAccessToken() {
            const refreshToken = await getRefreshToken();
            const response = await fetch(TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `refresh_token=${encodeURIComponent(refreshToken)}`,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.access_token) {
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('access_token_expiry', Date.now() + data.expires_in * 1000);
                    return data.access_token;
                } else {
                    throw new Error('Failed to retrieve access token');
                }
            } else {
                throw new Error('Failed to refresh access token');
            }
        }

        async function getShareToken(accessToken) {
            const response = await fetch(SHARE_TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `unique_name=${generateRandomHex(8)}&access_token=${accessToken}&expires_in=0&site_limit=&gpt35_limit=-1&gpt4_limit=-1&show_conversations=true`,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.token_key) {
                    localStorage.setItem('share_token', data.token_key);
                    localStorage.setItem('share_token_expiry', data.expire_at * 1000);
                    return data.token_key;
                } else {
                    throw new Error('Failed to retrieve share token');
                }
            } else {
                throw new Error('Failed to generate share token');
            }
        }

        function generateRandomHex(length) {
            const characters = '0123456789abcdef';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }

        async function autoLogin() {
            try {
                let accessToken = localStorage.getItem('access_token');
                const accessTokenExpiry = localStorage.getItem('access_token_expiry');

                // 检查 access_token 是否过期
                if (!accessToken || Date.now() >= accessTokenExpiry) {
                    console.log('Access token expired or missing, fetching new one...');
                    accessToken = await getAccessToken();
                }

                let shareToken = localStorage.getItem('share_token');
                const shareTokenExpiry = localStorage.getItem('share_token_expiry');

                // 检查 share_token 是否过期
                if (!shareToken || Date.now() >= shareTokenExpiry) {
                    console.log('Share token expired or missing, fetching new one...');
                    shareToken = await getShareToken(accessToken);
                }

                // 使用 share_token 自动登录
                const loginUrl = `${LOGIN_URL}?token=${shareToken}`;
                document.getElementById('status').innerText = '登录状态：已登录';
                window.location.href = loginUrl;
            } catch (error) {
                console.error(error);
                document.getElementById('status').innerText = '登录失败，请检查控制台';
            }
        }

        // 执行自动登录
        autoLogin();
    </script>
</body>
</html>
