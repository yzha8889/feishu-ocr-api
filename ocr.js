const { Client } = require('@larksuiteoapi/node-sdk');

module.exports = async (req, res) => {
  // 处理 GET 请求 - 显示上传表单
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
                  const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: reader.result.split(',')[1] })
                  });
                  const data = await response.json();
                  document.getElementById('result').textContent = 
                    JSON.stringify(data, null, 2);
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

  // 处理 POST 请求 - 处理 OCR
  if (req.method === 'POST') {
    try {
      const client = new Client({
        appId: process.env.APP_ID,
        appSecret: process.env.APP_SECRET
      });
      
      const base64 = req.body.image;
      
      const result = await client.api.ocr.v1.image.basic.post({
        data: { image: base64 }
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
};
