const lark = require('@larksuiteoapi/node-sdk');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    // HTML 表单代码保持不变
    return res.end(`...`);
  }

  // 处理 POST 请求
  if (req.method === 'POST') {
    try {
      // 初始化飞书客户端
      const client = new lark.Client({
        appId: process.env.APP_ID,
        appSecret: process.env.APP_SECRET,
        disableTokenCache: true
      });

      // 调用 OCR API
      const { data } = await client.request({
        url: '/open-apis/optical_char_recognition/v1/image/basic',
        method: 'POST',
        data: {
          image: req.body.image
        }
      });

      res.json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.toString() });
    }
  }
};
