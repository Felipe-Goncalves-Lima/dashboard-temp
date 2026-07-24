import React from 'react';
import { Target } from 'lucide-react';

export const RadarPanel = ({ dashboardData }) => {
  if (!dashboardData.enrichedLeads || dashboardData.enrichedLeads.length === 0) return null;

  return (
    <div className="glass-panel radar-panel" style={{ marginTop: '24px' }}>
      <h2 className="section-title" style={{ color: 'var(--status-warning)' }}>
        <Target size={24} />
        Radar de Perfis (IA)
      </h2>
      <p className="radar-desc">Últimos perfis enriquecidos passivamente nas conversas:</p>
      
      <div className="profile-list">
        {dashboardData.enrichedLeads.map((lead, idx) => (
          <div key={idx} className="profile-card">
            <h4>{lead.name}</h4>
            <div className="custom-scrollbar" style={{ fontSize: '13px', marginTop: '8px', lineHeight: '1.6', color: 'var(--text-secondary)', wordWrap: 'break-word', whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
              {lead.insight.split('\\n').map((line, i) => (
                <span key={i}>{line}<br/></span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
