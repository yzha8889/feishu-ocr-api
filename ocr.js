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
        <head><meta charset="utf-8"><title>OCR</title></head>
        <body>
          <input type="file" id="file" accept="image/*">
          <button onclick="upload()">上传</button>
          <pre id="result"></pre>
          <script>
            async function upload() {
              const file = document.getElementById('file').files[0];
              if (!file) return alert('请选择文件');
              
              const reader = new FileReader();
              reader.onload = async () => {
                try {
                  const base64 = reader.result.split(',')[1];
                  const res = await fetch('/', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({image: base64})
                  });
                  const data = await res.json();
                  document.getElementById('result').textContent = 
                    JSON.stringify(data, null, 2);
                } catch (e) {
                  document.getElementById('result').textContent = e;
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
      const token = await getTenantAccessToken();
      const response = await axios.post(
        'https://open.feishu.cn/open-apis/optical_char_recognition/v1/image/basic',
        { image: req.body.image },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json(error.response?.data || error.message);
    }
  }
};
