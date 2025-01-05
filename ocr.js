const { Client } = require('@larksuiteoapi/node-sdk');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    // 返回一个简单的 HTML 表单
    res.setHeader('Content-Type', 'text/html');
    return res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>OCR Test</title></head>
        <body>
          <form id="uploadForm">
            <input type="file" id="imageInput" accept="image/*">
            <button type="submit">识别图片</button>
          </form>
          <div id="result"></div>

          <script>
            document.getElementById('uploadForm').onsubmit = async (e) => {
              e.preventDefault();
              const file = document.getElementById('imageInput').files[0];
              if (!file) return alert('请选择图片');

              const reader = new FileReader();
              reader.onload = async () => {
                const base64 = reader.result.split(',')[1];
                try {
                  const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64 })
                  });
                  const data = await response.json();
                  document.getElementById('result').textContent = 
                    data.text ? data.text.join('\\n') : data.error;
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

  // 处理 POST 请求
  if (req.method === 'POST') {
    // 添加 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      const client = new Client({
        appId: process.env.APP_ID,
        appSecret: process.env.APP_SECRET
      });
      
      const base64 = req.body.image;
      const { data } = await client.api.ocr.v1.image.basic({
        data: {
          image: base64
        }
      });
      
      res.json({ text: data.text_list });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
