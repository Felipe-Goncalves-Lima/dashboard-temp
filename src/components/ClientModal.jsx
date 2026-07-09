import React from 'react';
import { X, MessageSquare, Phone, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function ClientModal({ client, onClose }) {
  if (!client) return null;

  const updates = client.updates || [];
  const historyData = [];
  const messages = [];

  updates.forEach(update => {
    const cleanBody = update.body.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]*>?/gm, ' ').trim();

    let score = 50; 
    const scoreMatch = cleanBody.match(/Saúde do Cliente:\s*(\d+)\/100/i);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1], 10);
    }
    
    let messageStr = '';
    const msgMatch = cleanBody.match(/Cliente .*? disse:\s*"([^"]+)"/i) || cleanBody.match(/Cliente .*? disse:\s*(.*?)(?=📝|$)/i);
    if (msgMatch) {
       messageStr = msgMatch[1].trim();
    } else {
       messageStr = cleanBody; 
    }

    const dateStr = new Date(update.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    
    historyData.push({
      date: dateStr,
      score: score,
      originalDate: new Date(update.created_at)
    });

    messages.push({
      date: new Date(update.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      text: messageStr
    });
  });

  let chartData = historyData.sort((a, b) => a.originalDate - b.originalDate);
  
  if (chartData.length === 1) {
    chartData.unshift({
      date: 'Início',
      score: chartData[0].score,
      originalDate: new Date(chartData[0].originalDate.getTime() - 86400000) 
    });
  }

  const handleCall = () => {
    if (client.telefone) {
      const number = client.telefone.replace(/\D/g, '');
      window.open(`https://wa.me/${number}`, '_blank');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        
        <div className="modal-header">
          <h2>{client.name}</h2>
          <span className="client-tel">{client.telefone || 'Sem telefone'}</span>
        </div>

        <div className="modal-body">
          <div className="modal-section chart-section">
            <h3><Activity size={18} /> Saúde do Cliente (Evolução)</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} tickMargin={8} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px' }}
                    itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="score" name="Saúde" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', stroke: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="modal-section messages-section">
            <h3><MessageSquare size={18} /> Últimas Mensagens</h3>
            <div className="messages-list">
              {messages.length > 0 ? messages.map((msg, i) => (
                <div key={i} className="message-bubble">
                  <span className="message-date">{msg.date}</span>
                  <p>{msg.text}</p>
                </div>
              )) : (
                <div className="no-messages">Nenhum histórico de mensagens encontrado.</div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="call-button" onClick={handleCall}>
            <Phone size={18} />
            Chamar no WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
