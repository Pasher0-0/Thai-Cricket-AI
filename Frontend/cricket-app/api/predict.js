// Vercel serverless proxy: forwards POST /api/predict to HF Space
// Place this file in Frontend/cricket-app/api/predict.js
const HF_PREDICT_URL = 'https://pasher0-0-cricket-api.hf.space/predict';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Read raw body from the incoming request
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyBuffer = Buffer.concat(chunks);

    // Clone headers but remove host (and content-length will be recalculated by fetch)
    const outgoingHeaders = { ...req.headers };
    delete outgoingHeaders.host;
    delete outgoingHeaders['content-length'];

    // Forward the request to the HF Space endpoint
    const forwarded = await fetch(HF_PREDICT_URL, {
      method: 'POST',
      headers: outgoingHeaders,
      body: bodyBuffer,
      // keep redirect behavior default
    });

    // Stream response headers and body back to the client
    res.status(forwarded.status);
    forwarded.headers.forEach((value, key) => {
      // Avoid setting hop-by-hop headers
      if (['transfer-encoding', 'connection', 'keep-alive'].includes(key)) return;
      res.setHeader(key, value);
    });

    const respBuffer = await forwarded.arrayBuffer();
    res.send(Buffer.from(respBuffer));
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', detail: String(err) });
  }
}
