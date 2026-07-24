import React from 'react';
import { Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const InteractionChart = ({ filter, trendData }) => {
  return (
    <div className="glass-panel chart-container">
      <div className="insights-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <Activity size={24} />
          Termômetro de Interações (Mensagens por Dia)
        </h2>
      </div>
      <div style={{ width: '100%', height: 200, marginTop: '20px' }}>
        <ResponsiveContainer>
          <BarChart key={filter} data={trendData} barGap={2} barCategoryGap="30%">
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e676" stopOpacity={1}/>
                <stop offset="95%" stopColor="#00e676" stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={1}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="colorDanger" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={1}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="colorGray" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748b" stopOpacity={1}/>
                <stop offset="95%" stopColor="#64748b" stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} tickMargin={10} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, 100]} />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{ background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', minWidth: '150px' }}>
                      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{label}</p>
                      {data.isNaoIniciadoOnly ? (
                        <p style={{ margin: '0 0 8px 0', color: '#9ca3af', fontSize: '14px' }}><strong>Sem mensagens</strong></p>
                      ) : (
                        <p style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '14px' }}>Média: <strong>{data.avgScore}</strong> / 100</p>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {data.satisfeitos > 0 && <span style={{ color: 'var(--status-success)', fontSize: '12px' }}>● {data.satisfeitos} Satisfeito(s)</span>}
                        {data.neutros > 0 && <span style={{ color: 'var(--status-warning)', fontSize: '12px' }}>● {data.neutros} Neutro(s)</span>}
                        {data.insatisfeitos > 0 && <span style={{ color: 'var(--status-danger)', fontSize: '12px' }}>● {data.insatisfeitos} Insatisfeito(s)</span>}
                        {data.naoIniciados > 0 && <span style={{ color: '#9ca3af', fontSize: '12px' }}>● {data.naoIniciados} Não Iniciado(s)</span>}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar name="Temperatura Média" dataKey="avgScore" radius={[6, 6, 0, 0]} activeBar={false}>
              {trendData.map((entry, index) => {
                let fill = 'url(#colorWarning)'; 
                if (entry.isNaoIniciadoOnly) fill = 'url(#colorGray)'; 
                else if (entry.avgScore >= 80) fill = 'url(#colorSuccess)'; 
                else if (entry.avgScore <= 39) fill = 'url(#colorDanger)'; 
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
