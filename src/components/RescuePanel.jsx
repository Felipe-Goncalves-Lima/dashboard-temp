import React from 'react';
import { ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

export const RescuePanel = ({ dashboardData, contactedLeads, toggleContacted, setSelectedClient }) => {
  return (
    <div className="glass-panel rescue-panel" style={{ marginTop: '24px' }}>
      <div className="insights-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <ShieldAlert size={24} />
          Listagem de Clientes
        </h2>
      </div>
      
      {(() => {
        const displayList = dashboardData.allClientsList;
        if (displayList && displayList.length > 0) {
          return (
            <div className="priority-list">
              {displayList.map(p => {
                const isContacted = contactedLeads.has(p.id);
                const isNegative = p.statusText === 'INSATISFEITO' || p.statusText === 'FRIO';
                const isPositive = p.statusText === 'SATISFEITO' || p.statusText === 'QUENTE';
                const isNeutral = p.statusText === 'NEUTRO';
                
                let statusColor = '#9ca3af';
                let tagBackground = 'rgba(156, 163, 175, 0.2)';
                if (isNegative) { statusColor = 'var(--status-danger)'; tagBackground = 'rgba(239, 68, 68, 0.1)'; }
                else if (isPositive) { statusColor = 'var(--status-success)'; tagBackground = 'rgba(16, 185, 129, 0.1)'; }
                else if (isNeutral) { statusColor = '#f59e0b'; tagBackground = 'rgba(245, 158, 11, 0.1)'; }
                
                let trendArrow = '';
                if (p.trend) {
                  if (p.trend < 0) trendArrow = ` ↘ ${p.trend}`;
                  else if (p.trend > 0) trendArrow = ` ↗ +${p.trend}`;
                }
                
                return (
                <div key={p.id} className="priority-item" onClick={() => setSelectedClient(p)} style={{ cursor: 'pointer', transition: 'all 0.3s ease', opacity: isContacted ? 0.5 : 1, transform: isContacted ? 'scale(0.98)' : 'scale(1)' }}>
                  <div className="client-info" style={{ filter: isContacted ? 'grayscale(100%)' : 'none' }}>
                    <h4 style={{ textDecoration: isContacted ? 'line-through' : 'none', color: isContacted ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{p.name}</h4>
                    <p>WhatsApp: {p.telefone}</p>
                    <div className="client-tags">
                      <span className="tag" style={{ background: tagBackground, color: statusColor }}>
                        {p.statusText || 'NÃO INICIADO'}{trendArrow}
                      </span>
                      <span className="tag">{p.time}</span>
                      {p.trend <= -30 && (
                        <span className="tag" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-danger)', fontWeight: 'bold' }}>
                          ⚠️ Queda Brusca
                        </span>
                      )}
                        <span className="tag" style={{ 
                          background: p.churnRisk >= 90 ? 'rgba(255, 0, 0, 0.2)' : (p.churnRisk > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)'), 
                          color: p.churnRisk >= 90 ? '#ff0000' : (p.churnRisk > 0 ? 'var(--status-warning)' : 'var(--text-secondary)'), 
                          fontWeight: 'bold', 
                          animation: p.churnRisk >= 90 ? 'pulse 1.5s infinite' : 'none' 
                        }}>
                          🔥 Churn: {p.churnRisk}%
                        </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      onClick={(e) => toggleContacted(p.id, e)}
                      style={{ 
                        background: isContacted ? 'var(--status-success)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isContacted ? 'var(--status-success)' : 'rgba(255,255,255,0.1)'}`,
                        color: isContacted ? '#000' : 'var(--text-secondary)',
                        width: '40px', height: '40px', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: isContacted ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
                      }}
                      title={isContacted ? 'Desmarcar' : 'Marcar como contatado'}
                    >
                      <CheckCircle2 size={20} />
                    </button>
                    <a 
                      href={`https://wa.me/${p.telefone.replace(/\D/g, '')}?text=Olá ${encodeURIComponent(p.name)}, tudo bem? Vi que você teve um contratempo recente e queria entender como posso te ajudar melhor!`}
                      target="_blank"
                      rel="noreferrer"
                      className="action-btn"
                      style={{ 
                        textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        filter: isContacted ? 'grayscale(100%) opacity(0.8)' : 'none' 
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Chamar <ChevronRight size={18} />
                    </a>
                  </div>
                </div>
                );
              })}
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '12px', opacity: 0.7 }}>
            <CheckCircle2 size={48} style={{ color: 'var(--status-success)' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', textAlign: 'center', margin: 0 }}>
              Tudo tranquilo! Nenhum cliente encontrado neste recorte. 🎉
            </p>
          </div>
        );
      })()}
    </div>
  );
};
