const fs = require('fs');

const dateSelectCode = `
export const DateSelect = ({ filter, setFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClick = (e) => { 
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); 
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  const options = ['Hoje', '7 Dias', '30 Dias', '6 Meses', '1 Ano'];
  const isCustom = filter.startsWith('date:');
  const displayValue = isCustom ? 'A partir de...' : filter;
  
  return (
    <div ref={ref} style={{ position: 'relative' }}>
       <div onClick={() => setIsOpen(!isOpen)} className="tab-btn active" style={{ display: 'flex', gap: '8px', alignItems: 'center', minWidth: '140px', justifyContent: 'space-between', cursor: 'pointer', padding: '6px 12px', width: '100%' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            {displayValue}
          </span>
          <ChevronDown size={14} />
       </div>
       {isOpen && (
         <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px', zIndex: 9999, minWidth: '200px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            {options.map(opt => (
              <div 
                key={opt}
                style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', color: filter === opt ? 'var(--status-success)' : '#fff', background: filter === opt ? 'rgba(255,255,255,0.05)' : 'transparent', fontSize: '13px' }}
                onClick={() => { setFilter(opt); setIsOpen(false); }}
              >
                {opt === '1 Ano' ? 'Último 1 Ano' : (opt === '6 Meses' ? 'Últimos 6 Meses' : (opt === '30 Dias' ? 'Últimos 30 Dias' : (opt === '7 Dias' ? 'Últimos 7 Dias' : 'Hoje')))}
              </div>
            ))}
            <div style={{ padding: '8px 12px', borderRadius: '4px', background: isCustom ? 'rgba(255,255,255,0.05)' : 'transparent', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span 
                style={{ cursor: 'pointer', color: isCustom ? 'var(--status-success)' : '#fff', fontSize: '13px' }}
                onClick={() => { 
                  if(!isCustom) { 
                    setFilter(\`date:\${new Date().toISOString().split('T')[0]}\`); 
                  } 
                }}
              >
                Data Específica...
              </span>
              {isCustom && (
                <input 
                  type="date" 
                  value={filter.split(':')[1]} 
                  onChange={(e) => setFilter(\`date:\${e.target.value}\`)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '4px 8px', borderRadius: '4px', outline: 'none', colorScheme: 'dark', width: '100%' }}
                />
              )}
            </div>
         </div>
       )}
    </div>
  );
};
`;

const filepath = 'c:/Users/felip/Documents/ForcaDIgital/frontTempCliente/frontTempCliente/src/components/Selects.jsx';
fs.appendFileSync(filepath, dateSelectCode);
console.log('Appended DateSelect to Selects.jsx');
