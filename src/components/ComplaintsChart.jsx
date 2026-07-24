import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2 } from 'lucide-react';

const COMPLAINT_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export const ComplaintsChart = ({ filter, ofensoresData }) => {
  return (
    <div className="glass-panel chart-card donut-chart">
      <h3>Principais Reclamações</h3>
      {ofensoresData && ofensoresData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart key={filter}>
            <Pie
              data={ofensoresData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              {ofensoresData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COMPLAINT_COLORS[index % COMPLAINT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
              itemStyle={{ color: '#fff' }}
              formatter={(value, name) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px', opacity: 0.7 }}>
          <CheckCircle2 size={48} style={{ color: 'var(--status-success)' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', textAlign: 'center', margin: 0 }}>
            Tudo certo por aqui!
          </p>
        </div>
      )}
    </div>
  );
};
