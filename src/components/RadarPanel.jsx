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
            <p style={{ fontSize: '12px', marginTop: '4px' }}>{lead.insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
