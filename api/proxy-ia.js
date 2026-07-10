export default async function handler(req, res) {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ignorar erro de SSL autoassinado do servidor VPS
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const n8nUrl = 'https://n8n-fepmc5vpguo7qlpexgctb9tk.2.24.204.112.sslip.io/webhook/dashboard-ia-summary';

  try {
    const fetchOptions = {
      method: req.method,
    };
    
    // Repassa o corpo da requisição exatamente como o Frontend enviou
    if (req.method === 'POST') {
      let bodyData = req.body;
      if (typeof bodyData !== 'string') {
        bodyData = JSON.stringify(bodyData);
      }
      fetchOptions.body = bodyData;
      fetchOptions.headers = { 'Content-Type': 'application/json' };
    }

    const response = await fetch(n8nUrl, fetchOptions);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro no Proxy (IA):', error);
    return res.status(500).json({ error: 'Falha ao buscar resumo IA no n8n' });
  }
}
