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
import { CustomSelect, SearchableSelect } from './components/Selects';
import { Header } from './components/Header';
import { KpiGrid } from './components/KpiGrid';
import { InteractionChart } from './components/InteractionChart';
import { SmartSummary } from './components/SmartSummary';
import { ComplaintsChart } from './components/ComplaintsChart';
import { RescuePanel } from './components/RescuePanel';
import { RadarPanel } from './components/RadarPanel';
import { InsightsPanel } from './components/InsightsPanel';

const COLORS = ['#00e676', '#fbbf24', '#64748b', '#f43f5e'];

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

            const isDateInRange = (dateString, filterStr) => {
        if (!dateString) return true;
        const itemDate = new Date(dateString);
        const diffTime = Math.abs(now - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (filterStr === 'Hoje') {
          return itemDate.getDate() === now.getDate() && itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        }
        if (filterStr === '7 Dias') return diffDays <= 7;
        if (filterStr === '30 Dias') return diffDays <= 30;
        if (filterStr === '6 Meses') return diffDays <= 180;
        if (filterStr === '1 Ano') return diffDays <= 365;
        if (filterStr.startsWith('date:')) {
          const selectedDate = new Date(filterStr.split(':')[1]);
          return itemDate >= selectedDate;
        }
        return true;
      };

      const filteredArray = baseFilteredArray.map(item => {
        if (!item.updates || item.updates.length === 0) return item;
        return {
          ...item,
          updates: item.updates.filter(u => isDateInRange(u.created_at || item.updated_at || item.created_at, filter))
        };
      }).filter(item => {
        const dateString = item.updated_at || item.created_at;
        return isDateInRange(dateString, filter);
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
          insight: i.text
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
    else if (filter === '30 Dias') days = 30;
    else if (filter === '6 Meses') days = 180;
    else if (filter === '1 Ano') days = 365;
    else if (filter.startsWith('date:')) {
      const selectedDate = new Date(filter.split(':')[1]);
      const diffTime = Math.abs(new Date() - selectedDate);
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (days < 2) days = 2;
    }

    const currentYear = new Date().getFullYear();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      
      let dateFormatted = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (d.getFullYear() !== currentYear) {
        dateFormatted = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
      }
      
      let dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      
      if (days > 7) {
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
      <Header 
        filter={filter} 
        setFilter={setFilter} 
        availableGroups={availableGroups} 
        availableClients={availableClients} 
        chartGroupFilter={chartGroupFilter} 
        setChartGroupFilter={setChartGroupFilter} 
        chartClientFilter={chartClientFilter} 
        setChartClientFilter={setChartClientFilter} 
      />

      <KpiGrid dashboardData={dashboardData} />

      <div className="top-grid">
        
        <InteractionChart filter={filter} trendData={trendData} />

        <SmartSummary insights={generateSmartInsights()} />
      </div>

      <div className="main-grid">
        
        <div className="left-col">
          <ComplaintsChart filter={filter} ofensoresData={ofensoresData} />

          <RescuePanel 
            dashboardData={dashboardData} 
            contactedLeads={contactedLeads} 
            toggleContacted={toggleContacted} 
            setSelectedClient={setSelectedClient} 
          />
        </div>

        <div className="right-col">
          <RadarPanel dashboardData={dashboardData} />
          <InsightsPanel 
            dashboardData={dashboardData} 
            insightTab={insightTab} 
            setInsightTab={setInsightTab} 
          />
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
