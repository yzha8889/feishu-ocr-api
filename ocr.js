const https = require('https');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    return res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>飞书 OCR 测试</title>
          <meta charset="utf-8">
        </head>
        <body>
          <form id="uploadForm">
            <input type="file" id="imageInput" accept="image/*">
            <button type="submit">识别图片</button>
          </form>
          <pre id="result"></pre>

          <script>
            document.getElementById('uploadForm').onsubmit = async (e) => {
              e.preventDefault();
              const file = document.getElementById('imageInput').files[0];
              if (!file) return alert('请选择图片');

              const reader = new FileReader();
              reader.onload = async () => {
                try {
                  console.log('正在发送图片...');
                  const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: reader.result.split(',')[1] })
                  });
                  const data = await response.json();
                  document.getElementById('result').textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                  document.getElementById('result').textContent = error.message;
                }
              };
              reader.readAsDataURL(file);
            };
          </script>
        </body>
      </html>
    `);
  }

  if (req.method === 'POST') {
    try {
      console.log('收到POST请求');
      
      // 获取 tenant_access_token
      const tokenResponse = await new Promise((resolve, reject) => {
        const tokenReq = https.request({
          hostname: 'open.feishu.cn',
          path: '/open-apis/auth/v3/tenant_access_token/internal',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }, res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(JSON.parse(data)));
        });

        tokenReq.on('error', reject);
        tokenReq.write(JSON.stringify({
          app_id: process.env.APP_ID,
          app_secret: process.env.APP_SECRET
        }));
        tokenReq.end();
      });

      console.log('获取到token:', tokenResponse);

      // 调用 OCR API
      const ocrResponse = await new Promise((resolve, reject) => {
        const ocrReq = https.request({
          hostname: 'open.feishu.cn',
          path: '/open-apis/optical_char_recognition/v1/image/basic',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenResponse.tenant_access_token}`
          }
        }, res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(JSON.parse(data)));
        });

        ocrReq.on('error', reject);
        ocrReq.write(JSON.stringify({
          image: req.body.image
        }));
        ocrReq.end();
      });

      console.log('OCR结果:', ocrResponse);
      res.json(ocrResponse);

    } catch (error) {
      console.error('错误:', error);
      res.status(500).json({ error: error.toString(), stack: error.stack });
    }
  }
};
