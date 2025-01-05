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
          <h1>图片文字识别</h1>
          <form id="uploadForm">
            <input type="file" id="imageInput" accept="image/*">
            <button type="submit">识别图片</button>
          </form>
          <div id="status"></div>
          <pre id="result"></pre>

          <script>
            const statusEl = document.getElementById('status');
            const resultEl = document.getElementById('result');

            document.getElementById('uploadForm').onsubmit = async (e) => {
              e.preventDefault();
              const file = document.getElementById('imageInput').files[0];
              if (!file) {
                alert('请选择图片');
                return;
              }

              statusEl.textContent = '正在处理...';
              const reader = new FileReader();
              
              reader.onload = async () => {
                try {
                  const response = await fetch(window.location.href, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      image: reader.result.split(',')[1]
                    })
                  });

                  const data = await response.json();
                  statusEl.textContent = '处理完成';
                  resultEl.textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                  statusEl.textContent = '发生错误';
                  resultEl.textContent = error.toString();
                }
              };

              reader.onerror = (error) => {
                statusEl.textContent = '读取文件失败';
                resultEl.textContent = error.toString();
              };

              reader.readAsDataURL(file);
            };
          </script>
        </body>
      </html>
    `);
  }

  if (req.method === 'POST') {
    console.log('Received POST request');
    try {
      if (!req.body || !req.body.image) {
        throw new Error('No image data received');
      }

      console.log('Image data length:', req.body.image.length);

      // 导入飞书 SDK
      const { Client } = require('@larksuiteoapi/node-sdk');

      console.log('Creating Feishu client with:', {
        appId: process.env.APP_ID,
        appSecret: '***' // 隐藏实际值
      });

      const client = new Client({
        appId: process.env.APP_ID,
        appSecret: process.env.APP_SECRET,
        disableTokenCache: true
      });

      console.log('Sending request to Feishu OCR API');
      const { data } = await client.request({
        url: '/open-apis/optical_char_recognition/v1/image/basic',
        method: 'POST',
        data: {
          image: req.body.image
        }
      });

      console.log('Received response from Feishu:', data);
      res.json(data);
    } catch (error
