import React from 'react';
import { Sparkles, UserCircle2 } from 'lucide-react';

export const InsightsPanel = ({ dashboardData, insightTab, setInsightTab }) => {
  if (!((dashboardData.insights && dashboardData.insights.length > 0) || dashboardData.generalSummary)) return null;

  return (
    <div className="glass-panel insights-panel" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column' }}>
      <div className="insights-header">
        <h2 className="section-title" style={{ margin: 0 }}>
          <Sparkles size={24} />
          Insights da IA
        </h2>
        <div className="tab-container">
          <button 
            className={`tab-btn ${insightTab === 'isolado' ? 'active' : ''}`}
            onClick={() => setInsightTab('isolado')}
          >
            Por Mensagem (Isolada)
          </button>
          <button 
            className={`tab-btn ${insightTab === 'contexto' ? 'active' : ''}`}
            onClick={() => setInsightTab('contexto')}
          >
            Por Contexto (15 msgs)
          </button>
          <button 
            className={`tab-btn ${insightTab === 'tom' ? 'active' : ''}`}
            onClick={() => setInsightTab('tom')}
          >
            Tom de Voz (Humor)
          </button>
        </div>
      </div>
      
      <div className="insight-content" style={{ flex: 1, overflowY: 'auto', maxHeight: '300px', paddingRight: '8px' }}>
        {insightTab === 'tom' && (
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCircle2 size={16} /> Análise Comportamental
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {dashboardData.kpis?.insatisfeitos > 0 
                ? "🔴 O clima atual está tenso. Os clientes estão majoritariamente ansiosos e frustrados, relatando urgência em retornos e clareza nos prazos."
                : (dashboardData.kpis?.satisfeitos > 0
                  ? "🟢 O clima é amigável e receptivo. Os clientes demonstram alinhamento com as entregas e estão satisfeitos com o contato."
                  : (dashboardData.kpis?.neutros > 0 
                    ? "🟡 Clientes estão impacientes e aguardando resoluções. O tom é de cobrança passiva, sem grandes atritos no momento."
                    : "⚪ Poucas interações recentes para determinar o tom predominante."))}
            </p>
          </div>
        )}
        
        {(insightTab === 'isolado' || insightTab === 'contexto') && dashboardData.insights && dashboardData.insights.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dashboardData.insights.map((insight, idx) => {
              const parts = insight.text ? insight.text.split('[COM CONTEXTO]:') : [];
              const isolado = parts[0] ? parts[0].replace('[MENSAGEM ISOLADA]:', '').trim() : insight.text;
              const contexto = parts[1] ? parts[1].trim() : "Aguardando próxima mensagem do cliente para gerar contexto histórico...";
              
              const showText = insightTab === 'isolado' ? isolado : contexto;
              
              return (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--status-success)' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-primary)' }}>{insight.name}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{showText}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
