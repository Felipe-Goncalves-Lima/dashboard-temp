export default async function handler(req, res) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const webhookUrl = process.env.VITE_API_IA_WEBHOOK_URL || 'http://localhost:5678/webhook/dashboard-ia-summary';

  try {
    let bodyData = null;
    if (req.method === 'POST') {
      try {
        // req.body pode vir como string se o Content-Type foi text/plain
        if (typeof req.body === 'string') {
          bodyData = JSON.parse(req.body);
        } else {
          bodyData = req.body; // já é objeto
        }
      } catch(e) {
        bodyData = req.body;
      }
    }

    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (bodyData) {
      fetchOptions.body = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);
    }

    const fetchResponse = await fetch(webhookUrl, fetchOptions);
    
    if (!fetchResponse.ok) {
      throw new Error(`Erro na API do n8n: ${fetchResponse.status}`);
    }

    const data = await fetchResponse.json();

    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro no Proxy IA:", error.message);
    return res.status(500).json({ error: "Erro no Proxy IA Serverless: " + error.message });
  }
}
