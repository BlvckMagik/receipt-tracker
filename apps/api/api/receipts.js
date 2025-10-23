export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check if this is a stats endpoint
  if (req.url.includes('/stats/categories')) {
    if (req.method === 'GET') {
      res.status(200).json([]);
      return;
    }
  }

  // Check if this is a specific receipt endpoint
  if (req.url.match(/\/receipts\/\d+$/)) {
    if (req.method === 'GET') {
      const receiptId = req.url.split('/').pop();
      res.status(200).json({
        id: receiptId,
        items: [],
        message: `Receipt ${receiptId} details`
      });
      return;
    }
  }

  if (req.method === 'GET') {
    res.status(200).json({ 
      receipts: [],
      message: 'Receipts endpoint working'
    });
  } else if (req.method === 'POST') {
    res.status(200).json({ 
      message: 'Upload endpoint working',
      body: req.body
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
