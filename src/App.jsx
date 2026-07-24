import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle2, ChevronRight, ChevronDown,
  MessageSquare, ShieldAlert, Sparkles, Zap, Building2, UserCircle2, Target, Calendar
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts';
import './App.css';
import ClientModal from './components/ClientModal';

const COLORS = ['#00e676', '#fbbf24', '#64748b', '#f43f5e'];
const COMPLAINT_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  return (
    <div ref={ref} style={{ position: 'relative' }}>
       <button onClick={() => setIsOpen(!isOpen)} className="tab-btn active" style={{ display: 'flex', gap: '8px', alignItems: 'center', minWidth: '120px', justifyContent: 'space-between' }}>
          {value === 'Todos' ? placeholder : value}
          <ChevronDown size={14} />
       </button>
       {isOpen && (
         <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px', zIndex: 9999, minWidth: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', maxHeight: '250px', overflowY: 'auto' }}>
            <div 
              style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', color: value === 'Todos' ? 'var(--primary)' : '#fff', background: value === 'Todos' ? 'rgba(255,255,255,0.05)' : 'transparent', fontSize: '13px' }}
              onClick={() => { onChange('Todos'); setIsOpen(false); }}
            >
              Todos
            </div>
            {options.map(opt => (
              <div 
                key={opt}
                style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', color: value === opt ? 'var(--primary)' : '#fff', background: value === opt ? 'rgba(255,255,255,0.05)' : 'transparent', fontSize: '13px' }}
                onClick={() => { onChange(opt); setIsOpen(false); }}
              >
                {opt}
              </div>
            ))}
         </div>
       )}
    </div>
  );
};

const SearchableSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClick = (e) => { 
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); 
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
  
  return (
    <div ref={ref} style={{ position: 'relative', width: '250px' }}>
       <div 
         className="tab-btn active" 
         style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', width: '100%', cursor: 'pointer' }}
         onClick={() => setIsOpen(!isOpen)}
       >
         {value === 'Todos' ? placeholder : (value.length > 20 ? value.substring(0, 20) + '...' : value)}
         <ChevronDown size={14} />
       </div>
       
       {isOpen && (
         <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', zIndex: 9999, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', outline: 'none' }}
              autoFocus
            />
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <div 
                style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', color: value === 'Todos' ? 'var(--primary)' : '#fff', background: value === 'Todos' ? 'rgba(255,255,255,0.05)' : 'transparent', fontSize: '13px' }}
                onClick={() => { onChange('Todos'); setIsOpen(false); setSearchTerm(''); }}
              >
                Todos
              </div>
              {filteredOptions.length === 0 && (
                <div style={{ padding: '8px 12px', color: '#9ca3af', fontSize: '13px' }}>Nenhum encontrado</div>
              )}
              {filteredOptions.map(opt => (
                <div 
                  key={opt}
                  style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', color: value === opt ? 'var(--primary)' : '#fff', background: value === opt ? 'rgba(255,255,255,0.05)' : 'transparent', fontSize: '13px' }}
                  onClick={() => { onChange(opt); setIsOpen(false); setSearchTerm(''); }}
                >
                  {opt}
                </div>
              ))}
            </div>
         </div>
       )}
    </div>
  );
};

function App() {
  const [filter, setFilter] = useState('7 Dias');
  const [insightTab, setInsightTab] = useState('isolado');
  const [clientTab, setClientTab] = useState('urgentes');
  const [allData, setAllData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartGroupFilter, setChartGroupFilter] = useState('Todos');
  const [chartClientFilter, setChartClientFilter] = useState('Todos');

  useEffect(() => {
    setChartClientFilter('Todos');
  }, [chartGroupFilter]);
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

  const availableGroups = useMemo(() => {
    if (!allData) return [];
    const groups = new Set();
    allData.forEach(item => {
      if (item.group && item.group.title) {
        groups.add(item.group.title);
      }
    });
    return Array.from(groups);
  }, [allData]);

  const availableClients = useMemo(() => {
    if (!allData) return [];
    const clients = new Set();
    allData.forEach(item => {
      if (chartGroupFilter !== 'Todos' && (!item.group || item.group.title !== chartGroupFilter)) return;
      if (item.name) {
        clients.add(item.name);
      }
    });
    return Array.from(clients);
  }, [allData, chartGroupFilter]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = '/api/dashboard-data';
        
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
      let satisfeitos = 0, neutros = 0, insatisfeitos = 0, naoIniciados = 0;
      const insights = [];
      const historyByDate = {};
      
      const now = new Date();
      
      const baseFilteredArray = allData.filter(item => {
        if (chartGroupFilter !== 'Todos' && (!item.group || item.group.title !== chartGroupFilter)) return false;
        if (chartClientFilter !== 'Todos' && item.name !== chartClientFilter) return false;
        return true;
      });

      const filteredArray = baseFilteredArray.filter(item => {
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

      baseFilteredArray.forEach(item => {
        
        if (item.updates && item.updates.length > 0) {
          item.updates.forEach(update => {
            if (update.created_at) {
              const dateObj = new Date(update.created_at);
              const dateStr = dateObj.toLocaleDateString('en-CA');
              
              if (!historyByDate[dateStr]) {
                historyByDate[dateStr] = { totalScore: 0, count: 0, satisfeitos: 0, insatisfeitos: 0, neutros: 0, naoIniciados: 0 };
              }

              const cleanBody = update.body.replace(/<[^>]*>?/gm, ' ').trim();
              const scoreMatch = cleanBody.match(/Saúde do Cliente:\s*(\d+)\/100(?:\s*\(([^)]+)\))?/i);
              if (scoreMatch && scoreMatch[1]) {
                const s = parseInt(scoreMatch[1], 10);
                historyByDate[dateStr].totalScore += s;
                historyByDate[dateStr].count += 1;
                
                let label = 'NEUTRO';
                if (scoreMatch[2]) label = scoreMatch[2].toUpperCase();
                
                if (label === 'SATISFEITO' || label === 'QUENTE') {
                  historyByDate[dateStr].satisfeitos += 1;
                } else if (label === 'INSATISFEITO' || label === 'FRIO') {
                  historyByDate[dateStr].insatisfeitos += 1;
                } else {
                  historyByDate[dateStr].neutros += 1;
                }
              }
            }
          });
        } else if (item.updated_at || item.created_at) {
          const dateObj = new Date(item.updated_at || item.created_at);
          const dateStr = dateObj.toLocaleDateString('en-CA');
          
          if (!historyByDate[dateStr]) {
            historyByDate[dateStr] = { totalScore: 0, count: 0, satisfeitos: 0, insatisfeitos: 0, neutros: 0, naoIniciados: 0 };
          }

          const statusCol = item.column_values ? item.column_values.find(c => c.id === 'status' || c.id === 'project_status' || (c.column && c.column.title === 'Temperatura')) : null;
          const statusText = statusCol ? (statusCol.text || '').toUpperCase() : '';

          if (statusText === 'SATISFEITO' || statusText === 'QUENTE') {
            historyByDate[dateStr].totalScore += 100;
            historyByDate[dateStr].count += 1;
            historyByDate[dateStr].satisfeitos += 1;
          } else if (statusText === 'INSATISFEITO' || statusText === 'FRIO') {
            historyByDate[dateStr].totalScore += 0;
            historyByDate[dateStr].count += 1;
            historyByDate[dateStr].insatisfeitos += 1;
          } else if (statusText === 'NEUTRO') {
            historyByDate[dateStr].totalScore += 50;
            historyByDate[dateStr].count += 1;
            historyByDate[dateStr].neutros += 1;
          } else {
            historyByDate[dateStr].naoIniciados += 1;
          }
        }
      });
      setHistoryData(historyByDate);

      filteredArray.forEach(item => {
        const statusCol = item.column_values.find(c => c.id === 'status' || c.id === 'project_status' || (c.column && c.column.title === 'Temperatura'));
        const statusText = statusCol ? (statusCol.text || '').toUpperCase() : '';
        
        const resumoCol = item.column_values.find(c => c.id === 'long_text_mm5em2pd' || (c.column && c.column.title === 'Resumo IA'));
        if (resumoCol && resumoCol.text && resumoCol.text.trim() !== '') {
           insights.push({ id: item.id, name: item.name, text: resumoCol.text });
        }

        if (statusText === 'SATISFEITO' || statusText === 'QUENTE') {
          satisfeitos++;
        }
        else if (statusText === 'INSATISFEITO' || statusText === 'FRIO') {
          insatisfeitos++;
        }
        else if (statusText === 'NEUTRO') {
          neutros++; 
        }
        else {
          naoIniciados++;
        }
      });

      const priorityList = filteredArray
        .filter(item => {
          const statusCol = item.column_values.find(c => c.id === 'status' || c.id === 'project_status' || (c.column && c.column.title === 'Temperatura'));
          const statusText = statusCol && statusCol.text ? statusCol.text.toUpperCase() : '';
          return statusText === 'INSATISFEITO' || statusText === 'FRIO';
        })
        .slice(0, 5)  
        .map((item, index) => {
          const telCol = item.column_values.find(c => c.id === 'text_mm5ehq7w' || (c.column && c.column.title === 'Telefone'));
          const telefone = telCol && telCol.text ? telCol.text : '';
          
          const statusCol = item.column_values.find(c => c.id === 'status' || c.id === 'project_status' || (c.column && c.column.title === 'Temperatura'));
          const statusText = statusCol && statusCol.text ? statusCol.text.toUpperCase() : '';

          const resumoCol = item.column_values.find(c => c.id === 'long_text_mm5em2pd' || (c.column && c.column.title === 'Resumo IA'));
          let churnRisk = 0;
          if (resumoCol && resumoCol.text) {
             const match = resumoCol.text.match(/\[RISCO DE CHURN\]:\s*(\d+)/i);
             if (match) {
                 churnRisk = parseInt(match[1], 10);
             }
          }

          let score = 0;
          let offensorTag = null;
          if (item.updates && item.updates.length > 0) {
             const lastUpdate = item.updates[0].body.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/gi, ' ');
             const scoreMatch = lastUpdate.match(/Saúde do Cliente:\s*(\d+)\/100/i);
             if (scoreMatch) score = parseInt(scoreMatch[1], 10);
             
             const churnUpdateMatch = lastUpdate.match(/Risco de Churn:\s*(\d+)%/i);
             if (churnUpdateMatch) churnRisk = parseInt(churnUpdateMatch[1], 10);
             
             const tagsSet = new Set();
             for (let u of item.updates) {
                 const text = u.body.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/gi, ' ');
                 const match = text.match(/Categoria Ofensor:[^#A-Za-z0-9À-ÖØ-öø-ÿ]*#?[^A-Za-z0-9À-ÖØ-öø-ÿ]*([\wÀ-ÖØ-öø-ÿ]+)/i);
                 if (match && match[1].toLowerCase() !== 'nenhum') {
                     tagsSet.add("#" + match[1]);
                 }
             }
             item.allOffensorTags = Array.from(tagsSet);
             if (item.allOffensorTags.length > 0) {
                 offensorTag = item.allOffensorTags[0]; 
             }
          }
          
          let trend = 0;
          if (item.updates && item.updates.length > 1) {
             const prevUpdate = item.updates[1].body.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/gi, ' ');
             const prevScoreMatch = prevUpdate.match(/Saúde do Cliente:\s*(\d+)\/100/i);
             if (prevScoreMatch) trend = score - parseInt(prevScoreMatch[1], 10);
          }

          return {
            id: item.id || index,
            name: item.name,
            telefone: telefone,
            statusText: statusText,
            company: 'Não identificada',
            role: 'Cliente',
            score: score,
            trend: trend,
            churnRisk: churnRisk,
            offensorTag: offensorTag,
            allOffensorTags: item.allOffensorTags || [],
            time: filter,
            updates: item.updates || [],
          };
        });

      const allClientsList = filteredArray.map((item, index) => {
          const telCol = item.column_values.find(c => c.id === 'text_mm5ehq7w' || (c.column && c.column.title === 'Telefone'));
          const telefone = telCol && telCol.text ? telCol.text : '';
          
          const statusCol = item.column_values.find(c => c.id === 'status' || c.id === 'project_status' || (c.column && c.column.title === 'Temperatura'));
          const statusText = statusCol && statusCol.text ? statusCol.text.toUpperCase() : '';

          const resumoCol = item.column_values.find(c => c.id === 'long_text_mm5em2pd' || (c.column && c.column.title === 'Resumo IA'));
          let churnRisk = 0;
          let score = 50;
          let offensorTag = null;
          if (resumoCol && resumoCol.text) {
             const match = resumoCol.text.match(/\[RISCO DE CHURN\]:\s*(\d+)/i);
             if (match) {
                 churnRisk = parseInt(match[1], 10);
             }
          }

          if (item.updates && item.updates.length > 0) {
             const lastUpdate = item.updates[0].body.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/gi, ' ');
             const scoreMatch = lastUpdate.match(/Saúde do Cliente:\s*(\d+)\/100/i);
             if (scoreMatch) score = parseInt(scoreMatch[1], 10);
             
             const churnUpdateMatch = lastUpdate.match(/Risco de Churn:\s*(\d+)%/i);
             if (churnUpdateMatch) churnRisk = parseInt(churnUpdateMatch[1], 10);
             
             const tagsSet = new Set();
             for (let u of item.updates) {
                 const text = u.body.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/gi, ' ');
                 const match = text.match(/Categoria Ofensor:[^#A-Za-z0-9À-ÖØ-öø-ÿ]*#?[^A-Za-z0-9À-ÖØ-öø-ÿ]*([\wÀ-ÖØ-öø-ÿ]+)/i);
                 if (match && match[1].toLowerCase() !== 'nenhum') {
                     tagsSet.add("#" + match[1]);
                 }
             }
             item.allOffensorTags = Array.from(tagsSet);
             if (item.allOffensorTags.length > 0) {
                 offensorTag = item.allOffensorTags[0];
             }
          }
          
          let trend = 0;
          if (item.updates && item.updates.length > 1) {
             const prevUpdate = item.updates[1].body.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/gi, ' ');
             const prevScoreMatch = prevUpdate.match(/Saúde do Cliente:\s*(\d+)\/100/i);
             if (prevScoreMatch) trend = score - parseInt(prevScoreMatch[1], 10);
          }

          return {
            id: item.id || index,
            name: item.name,
            telefone: telefone,
            statusText: statusText,
            company: 'Não identificada',
            role: 'Cliente',
            score: score,
            trend: trend,
            churnRisk: churnRisk,
            offensorTag: offensorTag,
            allOffensorTags: item.allOffensorTags || [],
            time: filter,
            updates: item.updates || [],
          };
      }).sort((a, b) => a.score - b.score);

      const enrichedLeadsList = insights.slice(0, 4).map(i => ({
          name: i.name,
          insight: i.text.length > 90 ? i.text.substring(0, 90) + '...' : i.text
      }));

      setDashboardData(prev => ({
        kpis: { satisfeitos, neutros, insatisfeitos, naoIniciados },
        priorities: priorityList,
        allClientsList: allClientsList,
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
          
          const API_IA_URL = '/api/dashboard-ia-summary';
          
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
          kpis: { satisfeitos: 0, neutros: 0, insatisfeitos: 0, naoIniciados: 0 },
          priorities: [],
          enrichedLeads: [],
          insights: [],
          generalSummary: 'O n8n conectou, mas não retornou dados do Monday. Verifique se o workflow está ativo e as credenciais configuradas.'
        });
      } else if (parsedData && parsedData.kpis) {
        setDashboardData(parsedData);
      } else {
        setDashboardData({
          kpis: { satisfeitos: 0, neutros: 0, insatisfeitos: 0, naoIniciados: 0 },
          priorities: [],
          enrichedLeads: [],
          insights: [],
          generalSummary: 'Aguardando dados válidos do n8n...'
        });
      }
    }
  }, [allData, filter, chartGroupFilter, chartClientFilter]);

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
      
      if (filter === '30 Dias') {
        dayName = dateFormatted;
      } else {
        if (filter === 'Hoje') {
          dayName = i === 1 ? 'Ontem' : 'Hoje';
        } else if (i === 0) {
          dayName = 'Hoje';
        }
        dayName = `${dayName} (${dateFormatted})`;
      }
      
      const dayData = historyData[dateStr];
      let avgScore = 0;
      let isNaoIniciadoOnly = false;
      if (dayData && dayData.count > 0) {
        avgScore = Math.round(dayData.totalScore / dayData.count);
      } else if (dayData && dayData.naoIniciados > 0) {
        avgScore = 5;
        isNaoIniciadoOnly = true;
      }
      
      data.push({ 
        day: dayName, 
        avgScore: avgScore,
        satisfeitos: dayData ? dayData.satisfeitos : 0,
        insatisfeitos: dayData ? dayData.insatisfeitos : 0,
        neutros: dayData ? dayData.neutros : 0,
        naoIniciados: dayData ? dayData.naoIniciados : 0,
        isNaoIniciadoOnly: isNaoIniciadoOnly
      });
    }
    return data;
  }, [filter, historyData]);

  const donutData = useMemo(() => {
    if (!dashboardData || !dashboardData.kpis) return [];
    return [
      { name: 'Satisfeitos', value: dashboardData.kpis.satisfeitos },
      { name: 'Neutros', value: dashboardData.kpis.neutros },
      { name: 'Insatisfeitos', value: dashboardData.kpis.insatisfeitos },
      { name: 'Não Iniciados', value: dashboardData.kpis.naoIniciados }
    ];
  }, [dashboardData]);

  useEffect(() => { window.dashboardDataDebug = dashboardData; }, [dashboardData]);
  const ofensoresData = useMemo(() => {
    if (!dashboardData || !dashboardData.allClientsList) return [];
    const counts = {};
    dashboardData.allClientsList.forEach(c => {
      if (c.updates && c.updates.length > 0 && c.allOffensorTags) {
        c.allOffensorTags.forEach(tag => {
           counts[tag] = (counts[tag] || 0) + 1;
        });
      } else if (c.offensorTag && c.offensorTag.toLowerCase() !== '#nenhum') { 
        counts[c.offensorTag] = (counts[c.offensorTag] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
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

  const generateSmartInsights = () => {
    if (!trendData || trendData.length === 0) return ["Aguardando dados para análise..."];
    
    let insights = [];
    
    let contexto = "toda a base";
    if (chartClientFilter !== 'Todos') contexto = `o cliente ${chartClientFilter}`;
    else if (chartGroupFilter !== 'Todos') contexto = `o grupo ${chartGroupFilter}`;

    let piorDia = null;
    let menorScore = 101;
    let temDado = false;
    
    trendData.forEach(d => {
      const hasInteractions = (d.satisfeitos + d.insatisfeitos + d.neutros) > 0;
      if (hasInteractions && !d.isNaoIniciadoOnly && d.avgScore < menorScore) {
        menorScore = d.avgScore;
        piorDia = d.day;
        temDado = true;
      }
    });

    if (temDado && menorScore <= 50) {
      insights.push(`🚨 O pior momento para ${contexto} foi **${piorDia}** (Média: ${menorScore}/100).`);
    } else if (temDado && menorScore > 80) {
      insights.push(`✨ ${contexto} está com excelente retenção! O pior dia (${piorDia}) manteve a saúde alta (${menorScore}/100).`);
    } else if (temDado) {
      insights.push(`ℹ️ A saúde de ${contexto} atingiu seu ponto mais baixo em **${piorDia}** (${menorScore}/100).`);
    }

    if (ofensoresData && ofensoresData.length > 0) {
      const topOfensor = ofensoresData[0];
      insights.push(`📌 O principal motivo de atrito no momento é **"${topOfensor.name}"** (${topOfensor.value} ocorrências).`);
    }

    const naoIniciados = trendData.reduce((acc, d) => acc + (d.naoIniciados || 0), 0);
    if (naoIniciados > 0) {
      insights.push(`⚠️ Existem **${naoIniciados}** conversas não iniciadas ou em stand-by neste recorte.`);
    }

    if (insights.length === 0) {
      return ["A operação está estável, sem alertas críticos para este filtro."];
    }
    
    return insights;
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

      {(availableGroups.length > 0 || availableClients.length > 0) && (
        <div className="glass-panel" style={{ display: 'flex', gap: '24px', padding: '16px 24px', marginBottom: '24px', alignItems: 'center', zIndex: 50, position: 'relative', background: 'var(--bg-card)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
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
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Cliente (WhatsApp):</span>
            <SearchableSelect 
              value={chartClientFilter} 
              onChange={setChartClientFilter} 
              options={availableClients} 
              placeholder="Todos"
            />
          </div>
        </div>
      )}

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
            <div className="kpi-icon-wrapper neutral">
              <MessageSquare size={32} />
            </div>
            <div className="kpi-content">
              <h3>Não Iniciados</h3>
              <div className="kpi-value">{dashboardData.kpis?.naoIniciados ?? 0}</div>
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

      <div className="top-grid">
        
        <div className="glass-panel chart-container">
          <div className="insights-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              <Activity size={24} />
              Termômetro de Interações (Mensagens por Dia)
            </h2>
          </div>
          <div style={{ width: '100%', height: 200, marginTop: '20px' }}>
            <ResponsiveContainer>
              <BarChart data={trendData} barGap={2} barCategoryGap="30%">
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
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  isAnimationActive={false}
                  wrapperStyle={{ transition: 'none', visibility: 'visible', outline: 'none' }}
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
                <Bar name="Temperatura Média" dataKey="avgScore" radius={[6, 6, 0, 0]} isAnimationActive={false} activeBar={false}>
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

        <div className="glass-panel chart-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#a855f7" />
            <h3 style={{ margin: 0, color: '#a855f7' }}>Resumo Inteligente</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(168, 85, 247, 0.05)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #a855f7' }}>
            {generateSmartInsights().map((insight, idx) => {
              const parts = insight.split('**');
              return (
                <p key={idx} style={{ margin: 0, fontSize: '14px', color: '#e2e8f0', lineHeight: '1.5' }}>
                  {parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: '#fff' }}>{part}</strong> : part)}
                </p>
              );
            })}
          </div>
        </div>
      </div>

      <div className="main-grid">
        
        <div className="left-col">
          <div className="glass-panel chart-card donut-chart">
            <h3>Principais Reclamações</h3>
            {ofensoresData && ofensoresData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
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
