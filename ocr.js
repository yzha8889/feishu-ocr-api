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
                  console.log('开始发送请求');
                  const response = await fetch(window.location.href, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: reader.result.split(',')[1] })
                  });
                  const data = await response.json();
                  console.log('收到响应:', data);
                  document.getElementById('result').textContent = 
                    JSON.stringify(data, null, 2);
                } catch (error) {
                  console.error('错误:', error);
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
    console.log('收到 POST 请求');
    console.log('请求体:', req.body);
    
    try {
      console.log('初始化飞书客户端');
      console.log('App ID:', process.env.APP_ID);
      console.log('App Secret:', '***');
      
      const client = new Client({
        appId: process.env.APP_ID,
        appSecret: process.env.APP_SECRET
      });
      
      console.log('开始调用 OCR API');
      const response = await client.api.ocr.v1.image.basic.post({
        data: {
          image: req.body.image
        }
      });
      
      console.log('OCR API 响应:', response);
      res.json(response);
    } catch (error) {
      console.error('发生错误:', error);
      res.status(500).json({ error: error.toString(), stack: error.stack });
    }
  }
};
