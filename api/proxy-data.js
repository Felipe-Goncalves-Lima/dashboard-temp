import https from 'https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const n8nUrl = 'https://n8n-fepmc5vpguo7qlpexgctb9tk.2.24.204.112.sslip.io/webhook/dashboard-data';

  // Usamos o módulo HTTPS nativo do Node porque o fetch novo ignora a regra de segurança TLS
  return new Promise((resolve) => {
    https.get(n8nUrl, { rejectUnauthorized: false }, (backendRes) => {
      let data = '';
      backendRes.on('data', chunk => { data += chunk; });
      backendRes.on('end', () => {
        try {
          const json = JSON.parse(data);
          res.status(200).json(json);
        } catch(e) {
          res.status(500).json({ error: 'Erro ao fazer parse do JSON do n8n', details: data });
        }
        resolve();
      });
    }).on('error', (e) => {
      console.error('Erro no Proxy (Data):', e);
      res.status(500).json({ error: 'Falha ao buscar dados no n8n', details: e.message });
      resolve();
    });
  });
}
