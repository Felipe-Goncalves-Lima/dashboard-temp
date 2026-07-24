import React from 'react';
import { CheckCircle2, MessageSquare, AlertTriangle } from 'lucide-react';

export const KpiGrid = ({ dashboardData }) => {
  return (
    <div className="kpi-grid">
      <div className="glass-panel kpi-card">
        <div className="kpi-icon-wrapper success">
          <CheckCircle2 size={32} />
        </div>
        <div className="kpi-content">
          <h3>Satisfeitos</h3>
          <div className="kpi-value">{dashboardData?.kpis?.satisfeitos ?? 0}</div>
        </div>
      </div>
      
      <div className="glass-panel kpi-card">
        <div className="kpi-icon-wrapper warning">
          <MessageSquare size={32} />
        </div>
        <div className="kpi-content">
          <h3>Neutros</h3>
          <div className="kpi-value">{dashboardData?.kpis?.neutros ?? 0}</div>
        </div>
      </div>
      
      <div className="glass-panel kpi-card">
        <div className="kpi-icon-wrapper neutral">
          <MessageSquare size={32} />
        </div>
        <div className="kpi-content">
          <h3>Não Iniciados</h3>
          <div className="kpi-value">{dashboardData?.kpis?.naoIniciados ?? 0}</div>
        </div>
      </div>

      <div className="glass-panel kpi-card">
        <div className="kpi-icon-wrapper danger">
          <AlertTriangle size={32} />
        </div>
        <div className="kpi-content">
          <h3>Insatisfeitos (Alerta)</h3>
          <div className="kpi-value">{dashboardData?.kpis?.insatisfeitos ?? 0}</div>
        </div>
      </div>
    </div>
  );
};
