import React from 'react';
import { X, MessageSquare, Phone, Activity, AlertTriangle, Info, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

export default function ClientModal({ client, onClose }) {
  if (!client) return null;

  const updates = client.updates || [];
  const historyData = [];
  const messages = [];

  updates.forEach(update => {
    const cleanBody = update.body.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]*>?/gm, ' ').trim();

    let score = 50; 
    let label = 'NEUTRO';
    const scoreMatch = cleanBody.match(/Saúde do Cliente:\s*(\d+)\/100(?:\s*\(([^)]+)\))?/i);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1], 10);
      if (scoreMatch[2]) label = scoreMatch[2].toUpperCase();
    }
    
    // Risco de Churn
    let churn = null;
    const churnMatch = cleanBody.match(/Risco de Churn:\s*(\d+)%/i);
    if (churnMatch) churn = parseInt(churnMatch[1], 10);

    // Mensagem do Cliente
    let messageStr = '';
    const msgMatch = cleanBody.match(/Cliente .*? disse:\s*"([^"]+)"/i) || cleanBody.match(/Cliente .*? disse:\s*(.*?)(?=📝|⚡|$)/i);
    if (msgMatch) {
       messageStr = msgMatch[1].trim();
    } else {
       messageStr = cleanBody; 
    }

    // Resumo
    let resumo = '';
    const resumoMatch = cleanBody.match(/Resumo e Motivo:\s*(.*?)(?=⚡|$)/i);
    if (resumoMatch) resumo = resumoMatch[1].trim();

    // Ações
    let actionItems = '';
    const actionMatch = cleanBody.match(/Itens de Ação Recomendados:\s*(.*)/i);
    if (actionMatch) actionItems = actionMatch[1].trim();

    const dateStr = new Date(update.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    
    historyData.push({
      date: dateStr,
      score: score,
      originalDate: new Date(update.created_at)
    });

    messages.push({
      date: new Date(update.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      text: messageStr,
      score,
      label,
      churn,
      resumo,
      actionItems,
      raw: cleanBody
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

  const getLabelColor = (l) => {
    if (l === 'SATISFEITO') return '#10b981';
    if (l === 'INSATISFEITO') return '#ef4444';
    return '#f59e0b'; // NEUTRO
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        
        <div className="modal-header">
          <h2>{client.name}</h2>
          <span className="client-tel">{client.telefone || 'Sem telefone'}</span>
        </div>

        <div className="modal-body" style={{ maxHeight: 'calc(90vh - 150px)', overflowY: 'auto' }}>
          <div className="modal-section chart-section">
            <h3><Activity size={18} /> Saúde do Cliente (Evolução)</h3>
            <div className="chart-wrapper" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', right: '16px', top: '-24px', display: 'flex', gap: '12px', fontSize: '11px', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.4)' }}></div> Satisfeito (80-100)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.4)' }}></div> Neutro (40-79)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.4)' }}></div> Insatisfeito (0-39)</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <ReferenceArea y1={80} y2={100} fill="rgba(16, 185, 129, 0.05)" />
                  <ReferenceArea y1={40} y2={79} fill="rgba(245, 158, 11, 0.05)" />
                  <ReferenceArea y1={0} y2={39} fill="rgba(239, 68, 68, 0.05)" />
                  
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} tickMargin={8} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} ticks={[0, 40, 80, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px' }}
                    itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    formatter={(value) => [`${value}/100`, 'Saúde']}
                  />
                  <Line type="monotone" dataKey="score" name="Saúde" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', stroke: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="modal-section messages-section">
            <h3><MessageSquare size={18} /> Histórico de Interações</h3>
            <div className="messages-list" style={{ gap: '16px', display: 'flex', flexDirection: 'column' }}>
              {messages.length > 0 ? messages.map((msg, i) => {
                // Se não conseguimos extrair o resumo, assumimos que é uma mensagem normal sem IA
                const isRich = msg.resumo !== '';
                
                return (
                  <div key={i} className="message-bubble" style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    padding: '16px',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span className="message-date" style={{ margin: 0 }}>{msg.date}</span>
                      {isRich && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: getLabelColor(msg.label) }}>
                            {msg.score}/100 ({msg.label})
                          </span>
                          {msg.churn > 0 && (
                            <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', background: msg.churn >= 70 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: msg.churn >= 70 ? '#ef4444' : '#f59e0b' }}>
                              Churn: {msg.churn}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {isRich ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            <MessageSquare size={14} /> Cliente disse:
                          </strong>
                          <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic', color: '#e2e8f0', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
                            "{msg.text}"
                          </p>
                        </div>
                        
                        <div>
                          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            <Info size={14} /> Análise da IA:
                          </strong>
                          <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>{msg.resumo}</p>
                        </div>

                        {msg.actionItems && (
                          <div>
                            <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#f59e0b', marginBottom: '4px' }}>
                              <Zap size={14} /> Recomendação:
                            </strong>
                            <p style={{ margin: 0, fontSize: '14px', color: '#fcd34d' }}>{msg.actionItems}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: '14px', color: '#e2e8f0' }}>{msg.text}</p>
                    )}
                  </div>
                );
              }) : (
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
