import https from 'https';
import { URL } from 'url';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const n8nUrl = 'https://n8n-fepmc5vpguo7qlpexgctb9tk.2.24.204.112.sslip.io/webhook/dashboard-ia-summary';
  const parsedUrl = new URL(n8nUrl);

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 443,
    path: parsedUrl.pathname + parsedUrl.search,
    method: req.method,
    rejectUnauthorized: false, // Isso permite bypassar o SSL
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve) => {
    const backendReq = https.request(options, (backendRes) => {
      let data = '';
      backendRes.on('data', chunk => { data += chunk; });
      backendRes.on('end', () => {
        try {
          const json = JSON.parse(data);
          res.status(200).json(json);
        } catch(e) {
          res.status(500).json({ error: 'Erro ao fazer parse do JSON da IA' });
        }
        resolve();
      });
    });

    backendReq.on('error', (e) => {
      console.error('Erro no Proxy (IA):', e);
      res.status(500).json({ error: 'Falha ao buscar resumo IA no n8n' });
      resolve();
    });

    if (req.method === 'POST') {
      let bodyData = req.body || {};
      if (typeof bodyData !== 'string') {
        bodyData = JSON.stringify(bodyData);
      }
      backendReq.write(bodyData);
    }
    
    backendReq.end();
  });
}
