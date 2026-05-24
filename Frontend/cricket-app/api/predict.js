// Vercel serverless proxy: forwards POST /api/predict to HF Space
// Uses CommonJS for better compatibility with Vercel Node.js runtime
const HF_PREDICT_URL = 'https://pasher0-0-cricket-api.hf.space/predict';

module.exports = async (req, res) => {
  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Forward the entire request (headers + body) to HF Space
    const response = await fetch(HF_PREDICT_URL, {
      method: 'POST',
      headers: {
        // Copy relevant headers from incoming request, skip hop-by-hop headers
        'content-type': req.headers['content-type'] || 'application/octet-stream',
      },
      body: req, // req stream contains the multipart body
    });

    // Copy response status and headers back to client
    res.status(response.status);
    
    // Forward response headers (skip hop-by-hop headers)
    const headersToSkip = ['transfer-encoding', 'connection', 'keep-alive', 'content-encoding'];
    for (const [key, value] of response.headers.entries()) {
      if (!headersToSkip.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    // Stream response body back
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ 
      error: 'Bad Gateway - Failed to proxy request to HF Space',
      detail: process.env.NODE_ENV === 'development' ? String(err) : undefined
    });
  }
};
