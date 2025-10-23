export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
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
