import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle2, ChevronRight, 
  MessageSquare, ShieldAlert, Sparkles, Zap, Building2, UserCircle2, Target, Calendar
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts';
import './App.css';
import ClientModal from './components/ClientModal';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

function App() {
  const [filter, setFilter] = useState('7 Dias');
  const [insightTab, setInsightTab] = useState('isolado');
  const [allData, setAllData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);
  const [contactedLeads, setContactedLeads] = useState(() => {
    try {
      const saved = localStorage.getItem('contactedLeads');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });
  const lastInsightsHash = useRef('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_WEBHOOK_URL || 'http://localhost:5678/webhook/dashboard-data';
        
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Falha na comunicação com o n8n');
        
        const rawData = await response.json();
        const rawArray = Array.isArray(rawData) ? rawData : [rawData];
        
        setAllData(prev => {
          if (prev && JSON.stringify(prev) === JSON.stringify(rawArray)) {
            return prev;
          }
          return rawArray;
        });
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError('O servidor de API (n8n) está inacessível ou ocorreu um erro de CORS.');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []); 

  useEffect(() => {
    if (!allData) return;

    if (allData.length > 0 && allData[0].column_values) {
      let satisfeitos = 0, neutros = 0, insatisfeitos = 0;
      const insights = [];
      const historyByDate = {};
      
      const now = new Date();
      
      const filteredArray = allData.filter(item => {
        if (!item.created_at) return true;
        const itemDate = new Date(item.created_at);
        const diffTime = Math.abs(now - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (filter === 'Hoje') {
          return itemDate.getDate() === now.getDate() && 
                 itemDate.getMonth() === now.getMonth() && 
                 itemDate.getFullYear() === now.getFullYear();
        }
        if (filter === '7 Dias') return diffDays <= 7;
        if (filter === '30 Dias') return diffDays <= 30;
        return true;
      });

      allData.forEach(item => {
        const statusCol = item.column_values.find(c => c.id === 'status' || (c.column && c.column.title === 'Temperatura'));
        const statusText = statusCol ? (statusCol.text || '').toUpperCase() : '';
        
        if (item.created_at) {
          const dateObj = new Date(item.created_at);
          const dateStr = dateObj.toLocaleDateString('en-CA');
          if (!historyByDate[dateStr]) {
            historyByDate[dateStr] = { satisfeitos: 0, insatisfeitos: 0, neutros: 0 };
          }
          if (statusText === 'SATISFEITO' || statusText === 'QUENTE') {
            historyByDate[dateStr].satisfeitos += 1;
          } else if (statusText === 'INSATISFEITO' || statusText === 'FRIO') {
            historyByDate[dateStr].insatisfeitos += 1;
          } else {
            historyByDate[dateStr].neutros += 1;
          }
        }
      });
      setHistoryData(historyByDate);

      filteredArray.forEach(item => {
        const statusCol = item.column_values.find(c => c.id === 'status' || (c.column && c.column.title === 'Temperatura'));
        const statusText = statusCol ? (statusCol.text || '').toUpperCase() : '';
        
        const resumoCol = item.column_values.find(c => c.column && c.column.title === 'Resumo IA');
        if (resumoCol && resumoCol.text && resumoCol.text.trim() !== '') {
           insights.push({ id: item.id, name: item.name, text: resumoCol.text });
        }

        if (statusText === 'SATISFEITO' || statusText === 'QUENTE') {
          satisfeitos++;
        }
        else if (statusText === 'INSATISFEITO' || statusText === 'FRIO') {
          insatisfeitos++;
        }
        else {
          neutros++; 
        }
      });

      const priorityList = filteredArray
        .filter(item => {
          const statusCol = item.column_values.find(c => c.column && c.column.title === 'Temperatura');
          const statusText = statusCol && statusCol.text ? statusCol.text.toUpperCase() : '';
          return statusText === 'INSATISFEITO' || statusText === 'FRIO';
        })
        .slice(0, 5)  
        .map((item, index) => {
          const telCol = item.column_values.find(c => c.column && c.column.title === 'Telefone');
          const telefone = telCol && telCol.text ? telCol.text : '';
          
          const resumoCol = item.column_values.find(c => c.column && c.column.title === 'Resumo IA');
          let churnRisk = 0;
          if (resumoCol && resumoCol.text) {
             const match = resumoCol.text.match(/\[RISCO DE CHURN\]:\s*(\d+)/i);
             if (match) {
                 churnRisk = parseInt(match[1], 10);
             }
          }

          return {
            id: item.id || index,
            name: item.name,
            telefone: telefone,
            company: 'Não identificada',
            role: 'Cliente',
            score: 0,
            churnRisk: churnRisk,
            time: filter,
            updates: item.updates || [],
          };
        });

      const enrichedLeadsList = insights.slice(0, 4).map(i => ({
          name: i.name,
          insight: i.text.length > 90 ? i.text.substring(0, 90) + '...' : i.text
      }));

      setDashboardData(prev => ({
        kpis: { satisfeitos, neutros, insatisfeitos },
        priorities: priorityList,
        enrichedLeads: enrichedLeadsList,
        insights: insights, 
        generalSummary: prev && prev.generalSummary ? prev.generalSummary : 'Atualizando análise da IA... ⏳'
      }));

      if (insights.length > 0) {
        const resumosText = insights.map(i => `${i.name}: ${i.text}`);
        const currentHash = JSON.stringify(resumosText);
        
        const cachedSummary = sessionStorage.getItem(`ia_summary_${filter}`);

        if (cachedSummary && currentHash === sessionStorage.getItem(`ia_hash_${filter}`)) {
          setDashboardData(prev => ({ ...prev, generalSummary: cachedSummary }));
        } else if (currentHash !== lastInsightsHash.current) {
          lastInsightsHash.current = currentHash;
          
          const API_IA_URL = import.meta.env.VITE_API_IA_WEBHOOK_URL || 'http://localhost:5678/webhook/dashboard-ia-summary';
          
          fetch(API_IA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ resumos: resumosText })
          })
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0 && data[0].summary) {
              if (!data[0].summary.includes('limite de uso')) {
                sessionStorage.setItem(`ia_summary_${filter}`, data[0].summary);
                sessionStorage.setItem(`ia_hash_${filter}`, currentHash);
              }
              setDashboardData(prev => ({
                ...prev,
                generalSummary: data[0].summary
              }));
            }
          })
          .catch(e => {
            setDashboardData(prev => ({
              ...prev,
              generalSummary: 'Análise da IA temporariamente indisponível. A base continua monitorada em tempo real.'
            }));
          });
        }
      }

    } else {
      const parsedData = Array.isArray(allData) ? allData[0] : allData;
      if (parsedData && parsedData.error) {
        setDashboardData({
          kpis: { satisfeitos: 0, neutros: 0, insatisfeitos: 0 },
          priorities: [],
          enrichedLeads: [],
          insights: [],
          generalSummary: 'O n8n conectou, mas não retornou dados do Monday. Verifique se o workflow está ativo e as credenciais configuradas.'
        });
      } else if (parsedData && parsedData.kpis) {
        setDashboardData(parsedData);
      } else {
        setDashboardData({
          kpis: { satisfeitos: 0, neutros: 0, insatisfeitos: 0 },
          priorities: [],
          enrichedLeads: [],
          insights: [],
          generalSummary: 'Aguardando dados válidos do n8n...'
        });
      }
    }
  }, [allData, filter]);

  const trendData = useMemo(() => {
    const data = [];
    let days = 7;
    if (filter === 'Hoje') days = 2;
    if (filter === '30 Dias') days = 30;

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const dateFormatted = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      let dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      
      if (filter === 'Hoje') {
        dayName = i === 1 ? 'Ontem' : 'Hoje';
      } else if (i === 0) {
        dayName = 'Hoje';
      }
      
      dayName = `${dayName} (${dateFormatted})`;
      
      const dayData = historyData[dateStr];
      
      data.push({ 
        day: dayName, 
        satisfeitos: dayData ? dayData.satisfeitos : 0,
        insatisfeitos: dayData ? dayData.insatisfeitos : 0,
        neutros: dayData ? dayData.neutros : 0
      });
    }
    return data;
  }, [filter, historyData]);

  const donutData = useMemo(() => {
    if (!dashboardData || !dashboardData.kpis) return [];
    return [
      { name: 'Satisfeitos', value: dashboardData.kpis.satisfeitos },
      { name: 'Neutros', value: dashboardData.kpis.neutros },
      { name: 'Insatisfeitos', value: dashboardData.kpis.insatisfeitos }
    ];
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <Zap size={60} className="logo-icon" style={{ animation: 'pulse 1.5s infinite' }} />
        <h2 style={{ color: 'var(--text-primary)' }}>Conectando com o Banco de Dados...</h2>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <AlertTriangle size={60} color="var(--status-danger)" />
        <h2 style={{ color: 'var(--text-primary)' }}>Erro de Conexão</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <p style={{ color: 'var(--text-secondary)' }}>Verifique se o Webhook do n8n está ativo e se o CORS está liberado.</p>
      </div>
    );
  }

  const toggleContacted = (id, e) => {
    e.stopPropagation();
    setContactedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      localStorage.setItem('contactedLeads', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="logo-area">
          <Zap size={40} className="logo-icon" />
          <div>
            <h1 className="title">Força Digital</h1>
            <p className="subtitle">Dashboard - Monitoramento de Clientes</p>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="filter-group glass-panel" style={{ padding: '8px', display: 'flex', gap: '4px' }}>
            {['Hoje', '7 Dias', '30 Dias'].map(f => (
              <button 
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                <Calendar size={14} /> {f}
              </button>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: '12px 24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Activity size={20} color="var(--status-success)" />
            <span style={{ fontWeight: 600 }}>API Conectada</span>
          </div>
        </div>
      </header>

      <div className="top-grid">
        <div className="kpi-grid">
          <div className="glass-panel kpi-card">
            <div className="kpi-icon-wrapper success">
              <CheckCircle2 size={32} />
            </div>
            <div className="kpi-content">
              <h3>Satisfeitos</h3>
              <div className="kpi-value">{dashboardData.kpis?.satisfeitos ?? 0}</div>
            </div>
          </div>
          
          <div className="glass-panel kpi-card">
            <div className="kpi-icon-wrapper warning">
              <MessageSquare size={32} />
            </div>
            <div className="kpi-content">
              <h3>Neutros</h3>
              <div className="kpi-value">{dashboardData.kpis?.neutros ?? 0}</div>
            </div>
          </div>

          <div className="glass-panel kpi-card">
            <div className="kpi-icon-wrapper danger">
              <AlertTriangle size={32} />
            </div>
            <div className="kpi-content">
              <h3>Insatisfeitos (Alerta)</h3>
              <div className="kpi-value">{dashboardData.kpis?.insatisfeitos ?? 0}</div>
            </div>
          </div>
        </div>

        <div className="glass-panel chart-card donut-chart">
          <h3>Distribuição de Saúde</h3>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="main-grid">
        
        <div className="left-col">
          <div className="glass-panel chart-container">
            <h2 className="section-title">
              <Activity size={24} />
              Evolução da Base (Novos Clientes)
            </h2>
            <div style={{ width: '100%', height: 200, marginTop: '20px' }}>
              <ResponsiveContainer>
                <BarChart data={trendData} barGap={2} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar name="Satisfeitos" dataKey="satisfeitos" fill="var(--status-success)" radius={[4, 4, 0, 0]} />
                  <Bar name="Neutros" dataKey="neutros" fill="var(--status-warning)" radius={[4, 4, 0, 0]} />
                  <Bar name="Insatisfeitos" dataKey="insatisfeitos" fill="var(--status-danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel rescue-panel" style={{ marginTop: '24px' }}>
              <h2 className="section-title">
                <ShieldAlert size={24} />
                Ação Imediata (Resgate)
              </h2>
              
              {dashboardData.priorities && dashboardData.priorities.length > 0 ? (
              <div className="priority-list">
                {dashboardData.priorities.map(p => {
                  const isContacted = contactedLeads.has(p.id);
                  return (
                  <div key={p.id} className="priority-item" onClick={() => setSelectedClient(p)} style={{ cursor: 'pointer', transition: 'all 0.3s ease', opacity: isContacted ? 0.5 : 1, transform: isContacted ? 'scale(0.98)' : 'scale(1)' }}>
                    <div className="client-info" style={{ filter: isContacted ? 'grayscale(100%)' : 'none' }}>
                      <h4 style={{ textDecoration: isContacted ? 'line-through' : 'none', color: isContacted ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{p.name}</h4>
                      <p>WhatsApp: {p.telefone}</p>
                      <div className="client-tags">
                        <span className="tag" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-danger)' }}>
                          Urgente
                        </span>
                        <span className="tag">{p.time}</span>
                        {p.churnRisk > 0 && (
                          <span className="tag" style={{ 
                            background: p.churnRisk >= 90 ? 'rgba(255, 0, 0, 0.2)' : 'rgba(245, 158, 11, 0.1)', 
                            color: p.churnRisk >= 90 ? '#ff0000' : 'var(--status-warning)', 
                            fontWeight: 'bold', 
                            animation: p.churnRisk >= 90 ? 'pulse 1.5s infinite' : 'none' 
                          }}>
                            🔥 Churn: {p.churnRisk}%
                          </span>
                        )}
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
              ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '12px', opacity: 0.7 }}>
                <CheckCircle2 size={48} style={{ color: 'var(--status-success)' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', textAlign: 'center', margin: 0 }}>
                  Tudo tranquilo! Nenhum cliente precisa de atenção imediata. 🎉
                </p>
              </div>
              )}
            </div>
        </div>

        <div className="right-col">
          {dashboardData.enrichedLeads && dashboardData.enrichedLeads.length > 0 && (
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
          )}

          {((dashboardData.insights && dashboardData.insights.length > 0) || dashboardData.generalSummary) && (
            <div className="glass-panel insights-panel" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column' }}>
              <div className="insights-header">
                <h2 className="section-title" style={{ margin: 0 }}>
                  <Sparkles size={24} />
                  Insights da IA
                </h2>
                <div className="tab-container">
                  <button 
                    className={`tab-btn ${insightTab === 'general' ? 'active' : ''}`}
                    onClick={() => setInsightTab('general')}
                  >
                    Geral (Base Inteira)
                  </button>
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
                </div>
              </div>
              
              <div className="insight-content" style={{ flex: 1, overflowY: 'auto', maxHeight: '300px', paddingRight: '8px' }}>
                {insightTab === 'general' && dashboardData.generalSummary && (
                  <p style={{ marginBottom: '0', lineHeight: '1.6', fontSize: '15px' }}>
                    {dashboardData.generalSummary.replace(/\*\*/g, '')}
                  </p>
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
          )}
        </div>

      </div>
      
      <ClientModal 
        client={selectedClient} 
        onClose={() => setSelectedClient(null)} 
      />
    </div>
  );
}

export default App;
