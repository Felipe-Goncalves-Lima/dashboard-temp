export default async function handler(req, res) {
  // Configuração de CORS para permitir acesso local/vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // TRUQUE DE MÁGICA: Isso instrui o Node.js da Vercel a ignorar o erro do SSL (ERR_CERT_AUTHORITY_INVALID)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const n8nUrl = 'https://n8n-fepmc5vpguo7qlpexgctb9tk.2.24.204.112.sslip.io/webhook/dashboard-data';

  try {
    const response = await fetch(n8nUrl);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro no Proxy (Data):', error);
    return res.status(500).json({ error: 'Falha ao buscar dados no n8n' });
  }
}
