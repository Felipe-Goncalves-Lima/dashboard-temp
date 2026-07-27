import React from 'react';
import { Calendar, Activity, Zap, ChevronDown } from 'lucide-react';
import { CustomSelect, SearchableSelect, DateSelect } from './Selects';

export const Header = ({
  filter,
  setFilter,
  availableGroups,
  availableClients,
  chartGroupFilter,
  setChartGroupFilter,
  chartClientFilter,
  setChartClientFilter
}) => {
  return (
    <>
      <header className="header">
        <div className="logo-area">
          <Zap size={40} className="logo-icon" />
          <div>
            <h1 className="title">Força Digital</h1>
            <p className="subtitle">Dashboard - Monitoramento de Clientes</p>
          </div>
        </div>
        
        <div className="header-actions">
          <DateSelect filter={filter} setFilter={setFilter} />

          <div className="glass-panel" style={{ padding: '12px 24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Activity size={20} color="var(--status-success)" />
            <span style={{ fontWeight: 600 }}>API Conectada</span>
          </div>
        </div>
      </header>

      {(availableGroups.length > 0 || availableClients.length > 0) && (
        <div className="glass-panel global-filters" style={{ zIndex: 50, position: 'relative', background: 'var(--bg-card)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
          <span style={{ fontWeight: 600, color: '#fff' }}>Filtros Globais:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Squad:</span>
            <CustomSelect 
              value={chartGroupFilter} 
              onChange={setChartGroupFilter} 
              options={availableGroups} 
              placeholder="Todos"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Cliente:</span>
            <SearchableSelect 
              value={chartClientFilter} 
              onChange={setChartClientFilter} 
              options={availableClients} 
              placeholder="Todos"
            />
          </div>
        </div>
      )}
    </>
  );
};
