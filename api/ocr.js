const axios = require('axios');

async function getTenantAccessToken() {
  const response = await axios.post(
    'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
    {
      app_id: process.env.cli_a7fd6d727278d00c,
      app_secret: process.env.i6toCbZ1UAHsz01xNVEiGfyixXEvnU73
    }
  );
  return response.data.tenant_access_token;
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    return res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>飞书 OCR 测试</title>
        </head>
        <body>
          <input type="file" id="file" accept="image/*">
          <button onclick="upload()">识别图片</button>
          <pre id="result"></pre>
          <script>
            async function upload() {
              const file = document.getElementById('file').files[0];
              if (!file) return alert('请选择文件');
              
              const reader = new FileReader();
              reader.onload = async () => {
                try {
                  // 确保只发送 base64 编码部分
                  const base64Data = reader.result.split(',')[1];
                  console.log('Image size:', base64Data.length);
                  
                  const res = await fetch('/', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      image: base64Data
                    })
                  });
                  const data = await res.json();
                  document.getElementById('result').textContent = 
                    JSON.stringify(data, null, 2);
                } catch (e) {
                  document.getElementById('result').textContent = 
                    '错误: ' + e.toString();
                }
              };
              reader.readAsDataURL(file);
            }
          </script>
        </body>
      </html>
    `);
  }

  if (req.method === 'POST') {
    try {
      // 获取 token
      const token = await getTenantAccessToken();
      console.log('Got token:', token);

      // 调用 OCR API
      const response = await axios.post(
        'https://open.feishu.cn/open-apis/optical_char_recognition/v1/image/basic',
        {
          image: req.body.image // 直接发送 base64 字符串
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('OCR response:', response.data);
      res.json(response.data);
    } catch (error) {
      console.error('Error:', error.response?.data || error);
      res.status(500).json({
        error: error.response?.data || error.message,
        details: error.response?.data
      });
    }
  }
};
