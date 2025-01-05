const { Client } = require('@larksuiteoapi/node-sdk');

module.exports = async (req, res) => {
  // 添加 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Starting OCR process');
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
};