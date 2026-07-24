import React from 'react';
import { Sparkles } from 'lucide-react';

export const SmartSummary = ({ insights }) => {
  return (
    <div className="glass-panel chart-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={20} color="#a855f7" />
        <h3 style={{ margin: 0, color: '#a855f7' }}>Resumo Inteligente</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(168, 85, 247, 0.05)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #a855f7' }}>
        {insights.map((insight, idx) => {
          const parts = insight.split('**');
          return (
            <p key={idx} style={{ margin: 0, fontSize: '14px', color: '#e2e8f0', lineHeight: '1.5' }}>
              {parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: '#fff' }}>{part}</strong> : part)}
            </p>
          );
        })}
      </div>
    </div>
  );
};
