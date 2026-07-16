export default async function handler(req, res) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const webhookUrl = process.env.VITE_API_WEBHOOK_URL || 'http://localhost:5678/webhook-test/dashboard-data';

  try {
    const fetchResponse = await fetch(webhookUrl);
    
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
    console.error("Erro no Proxy:", error.message);
    return res.status(500).json({ error: "Erro no Proxy Serverless: " + error.message });
  }
}
