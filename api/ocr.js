const FSDK = require('feishu-sdk');

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
    const FAPI = await FSDK(process.env.APP_ID, process.env.APP_SECRET);
    
    const base64 = req.body.image;
    const text = await FAPI.ai.ocr(base64);
    
    res.json({ text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};
